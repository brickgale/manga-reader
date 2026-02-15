import https from 'https';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const MANGADEX_API_BASE = 'https://api.mangadex.org';
const KITSU_API_BASE = 'https://kitsu.io/api/edge';
const BATCH_SIZE = 3;
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay to be respectful to the API
const DELAY_BETWEEN_REQUESTS = 500; // 500ms delay between individual requests

interface MangaDexMangaData {
  id: string;
  attributes: {
    title: {
      en?: string;
      ja?: string;
      [key: string]: string | undefined;
    };
    description?: {
      en?: string;
      [key: string]: string | undefined;
    };
    status?: string;
  };
  relationships?: Array<{
    type: string;
    id: string;
    attributes?: any;
  }>;
}

interface MangaDexResponse {
  result: string;
  data: MangaDexMangaData[];
}

interface KitsuMangaData {
  id: string;
  attributes: {
    canonicalTitle: string;
    synopsis?: string;
    posterImage?: {
      small?: string;
      medium?: string;
      large?: string;
      original?: string;
    };
    coverImage?: {
      small?: string;
      large?: string;
      original?: string;
    };
    averageRating?: string;
    status?: string;
  };
}

interface KitsuResponse {
  data: KitsuMangaData[];
}

export interface MangaMetadata {
  title: string;
  coverImage?: string;
  synopsis?: string;
  rating?: string;
  status?: string;
}

/**
 * Download image and save it locally
 */
async function downloadImage(url: string, mangaTitle: string, force: boolean = false): Promise<string | null> {
  try {
    // Create a safe filename from the cover URL (not manga title) for uniqueness
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const ext = path.extname(url.split('?')[0]) || '.jpg';
    const filename = `${hash}${ext}`;
    const coverDir = path.join(process.cwd(), 'images', 'covers');
    const filePath = path.join(coverDir, filename);
    
    // Ensure directory exists
    await fs.mkdir(coverDir, { recursive: true });
    
    // Check if file already exists (skip if force is true)
    if (!force) {
      try {
        await fs.access(filePath);
        console.log(`Cover already exists: ${filename}`);
        return `/covers/${filename}`;
      } catch {
        // File doesn't exist, download it
      }
    } else {
      console.log(`Force re-downloading cover: ${filename}`);
    }
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'MangaReader/1.0',
          'Referer': 'https://mangadex.org/'
        }
      };
      
      https.get(url, options, (res) => {
        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          if (res.headers.location) {
            console.log(`Following redirect to: ${res.headers.location}`);
            https.get(res.headers.location, options, handleResponse).on('error', reject);
            return;
          }
        }
        
        handleResponse(res);
      }).on('error', (error) => {
        console.error(`Download error for ${mangaTitle}:`, error.message);
        resolve(null); // Return null instead of rejecting
      });
      
      function handleResponse(res: any) {
        if (res.statusCode !== 200) {
          console.error(`Failed to download image for ${mangaTitle}: HTTP ${res.statusCode}`);
          resolve(null); // Return null instead of rejecting
          return;
        }
        
        const chunks: Buffer[] = [];
        
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        res.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            await fs.writeFile(filePath, buffer);
            console.log(`Saved cover image: ${filename}`);
            resolve(`/covers/${filename}`);
          } catch (error) {
            console.error(`Failed to save image for ${mangaTitle}:`, error);
            resolve(null);
          }
        });
      }
    });
  } catch (error) {
    console.error(`Failed to download image for ${mangaTitle}:`, error);
    return null;
  }
}

/**
 * Make a GET request using built-in https module
 */
function httpsGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'MangaReader/1.0'
      }
    }, (res) => {
      let data = '';
      
      // Check for error status codes
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${data.substring(0, 100)}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Search for manga on Kitsu API (fallback)
 */
async function searchMangaKitsu(title: string): Promise<MangaMetadata | null> {
  try {
    const encodedTitle = encodeURIComponent(title);
    const url = `${KITSU_API_BASE}/manga?filter[text]=${encodedTitle}`;
    
    const response: KitsuResponse = await httpsGet(url);

    if (!response.data || response.data.length === 0) {
      console.log(`Kitsu: No results found for: ${title}`);
      return null;
    }

    // Get the first result (best match)
    const manga = response.data[0];
    
    return {
      title: manga.attributes.canonicalTitle,
      coverImage: manga.attributes.posterImage?.large || manga.attributes.posterImage?.medium,
      synopsis: manga.attributes.synopsis,
      rating: manga.attributes.averageRating,
      status: manga.attributes.status,
    };
  } catch (error) {
    console.error(`Kitsu error for "${title}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate string similarity (case-insensitive) using multiple techniques
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }
  
  // Word-based similarity (Jaccard coefficient)
  const words1 = s1.split(/\s+/).filter(w => w.length > 0);
  const words2 = s2.split(/\s+/).filter(w => w.length > 0);
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(w => set2.has(w)));
  const union = new Set([...set1, ...set2]);
  const jaccardScore = intersection.size / union.size;
  
  // Levenshtein-based similarity (normalized)
  const maxLen = Math.max(s1.length, s2.length);
  const levDistance = levenshteinDistance(s1, s2);
  const levScore = 1 - (levDistance / maxLen);
  
  // Use weighted average: 60% word-based, 40% character-based
  return (jaccardScore * 0.6) + (levScore * 0.4);
}

/**
 * Search for manga on MangaDex API
 */
async function searchMangaMangaDex(title: string): Promise<MangaMetadata | null> {
  try {
    const encodedTitle = encodeURIComponent(title);
    // Get more results to find the best match
    const url = `${MANGADEX_API_BASE}/manga?title=${encodedTitle}&limit=5&includes[]=cover_art`;
    
    const response: MangaDexResponse = await httpsGet(url);

    if (!response.data || response.data.length === 0) {
      console.log(`MangaDex: No results found for: ${title}`);
      return null;
    }

    // Find the best matching result based on title similarity
    let bestMatch = response.data[0];
    let bestScore = 0;
    
    for (const manga of response.data) {
      const mangaTitle = manga.attributes.title.en || 
                        manga.attributes.title.ja || 
                        Object.values(manga.attributes.title)[0] || '';
      
      const score = calculateSimilarity(title, mangaTitle);
      console.log(`MangaDex: "${mangaTitle}" - similarity: ${(score * 100).toFixed(1)}%`);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = manga;
      }
    }
    
    // Reject if similarity is too low (less than 60%)
    if (bestScore < 0.60) {
      console.log(`MangaDex: Best match score ${(bestScore * 100).toFixed(1)}% too low for: ${title}`);
      return null;
    }
    
    const manga = bestMatch;
    
    // Extract title (prefer English, fallback to Japanese or first available)
    const mangaTitle = manga.attributes.title.en || 
                       manga.attributes.title.ja || 
                       Object.values(manga.attributes.title)[0] || 
                       title;
    
    // Extract cover art from relationships
    let coverImage: string | undefined;
    const coverArtRelation = manga.relationships?.find(rel => rel.type === 'cover_art');
    if (coverArtRelation && coverArtRelation.attributes?.fileName) {
      coverImage = `https://uploads.mangadex.org/covers/${manga.id}/${coverArtRelation.attributes.fileName}`;
    }
    
    // Extract description (prefer English)
    const synopsis = manga.attributes.description?.en;
    
    return {
      title: mangaTitle,
      coverImage,
      synopsis,
      status: manga.attributes.status,
    };
  } catch (error) {
    console.error(`MangaDex error for "${title}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Search for manga - tries MangaDex first, then Kitsu as fallback
 */
export async function searchManga(title: string): Promise<MangaMetadata | null> {
  // Try MangaDex first
  console.log(`Searching for: ${title}`);
  let metadata = await searchMangaMangaDex(title);
  
  // If MangaDex fails or returns no cover image, try Kitsu
  if (!metadata || !metadata.coverImage) {
    console.log(`Trying Kitsu for: ${title}`);
    const kitsuMetadata = await searchMangaKitsu(title);
    
    // If Kitsu has better data, use it
    if (kitsuMetadata) {
      if (!metadata) {
        metadata = kitsuMetadata;
      } else {
        // Merge: use Kitsu's cover if MangaDex didn't have one
        metadata.coverImage = metadata.coverImage || kitsuMetadata.coverImage;
        metadata.synopsis = metadata.synopsis || kitsuMetadata.synopsis;
      }
    }
  }
  
  // Download and save cover image locally
  if (metadata && metadata.coverImage && metadata.coverImage.startsWith('http')) {
    console.log(`Downloading cover for "${title}" from: ${metadata.coverImage}`);
    const localPath = await downloadImage(metadata.coverImage, title);
    if (localPath) {
      console.log(`Cover saved locally: ${localPath}`);
      metadata.coverImage = localPath;
    } else {
      console.log(`Failed to download cover for "${title}"`);
    }
  }
  
  return metadata;
}

/**
 * Search for multiple manga titles in batches
 */
export async function searchMangaBatch(titles: string[]): Promise<Map<string, MangaMetadata | null>> {
  const results = new Map<string, MangaMetadata | null>();
  
  // Process titles in batches
  for (let i = 0; i < titles.length; i += BATCH_SIZE) {
    const batch = titles.slice(i, i + BATCH_SIZE);
    
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(titles.length / BATCH_SIZE)} (${batch.length} items)`);
    
    // Process batch sequentially with delays to avoid rate limiting
    for (const title of batch) {
      const metadata = await searchManga(title);
      results.set(title, metadata);
      
      // Add delay between requests
      if (batch.indexOf(title) < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }
    }
    
    // Add delay between batches (except for the last batch)
    if (i + BATCH_SIZE < titles.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  return results;
}

/**
 * Fetch manga details from MangaDex by manga ID
 */
export async function getMangaByMangaDexId(mangadexId: string): Promise<MangaMetadata | null> {
  try {
    // Extract ID from URL if a full URL was provided
    let mangaId = mangadexId;
    if (mangadexId.includes('mangadex.org')) {
      const match = mangadexId.match(/\/title\/([a-f0-9-]+)/i);
      if (match) {
        mangaId = match[1];
      }
    }
    
    const url = `${MANGADEX_API_BASE}/manga/${mangaId}?includes[]=cover_art`;
    console.log(`Fetching MangaDex manga by ID: ${mangaId}`);
    
    const response = await httpsGet(url);

    if (!response.data) {
      console.log(`MangaDex: No manga found for ID: ${mangaId}`);
      return null;
    }

    const manga = response.data;
    
    // Extract title (prefer English, fallback to Japanese or first available)
    const mangaTitle = manga.attributes.title.en || 
                       manga.attributes.title.ja || 
                       Object.values(manga.attributes.title)[0] || 
                       mangaId;
    
    // Extract cover art from relationships
    let coverImage: string | undefined;
    const coverArtRelation = manga.relationships?.find((rel: any) => rel.type === 'cover_art');
    if (coverArtRelation && coverArtRelation.attributes?.fileName) {
      coverImage = `https://uploads.mangadex.org/covers/${manga.id}/${coverArtRelation.attributes.fileName}`;
    }
    
    // Extract description (prefer English)
    const synopsis = manga.attributes.description?.en;
    
    const metadata: MangaMetadata = {
      title: mangaTitle,
      coverImage,
      synopsis,
      status: manga.attributes.status,
    };
    
    // Download and save cover image locally (force re-download)
    if (metadata.coverImage && metadata.coverImage.startsWith('http')) {
      console.log(`Downloading cover for "${mangaTitle}" from: ${metadata.coverImage}`);
      const localPath = await downloadImage(metadata.coverImage, mangaTitle, true);
      if (localPath) {
        console.log(`Cover saved locally: ${localPath}`);
        metadata.coverImage = localPath;
      } else {
        console.log(`Failed to download cover for "${mangaTitle}"`);
      }
    }
    
    return metadata;
  } catch (error) {
    console.error(`MangaDex error for ID "${mangadexId}":`, error instanceof Error ? error.message : error);
    return null;
  }
}
