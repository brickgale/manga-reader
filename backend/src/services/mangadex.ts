import https from 'https';

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
 * Search for manga on MangaDex API
 */
async function searchMangaMangaDex(title: string): Promise<MangaMetadata | null> {
  try {
    const encodedTitle = encodeURIComponent(title);
    const url = `${MANGADEX_API_BASE}/manga?title=${encodedTitle}&limit=1&includes[]=cover_art`;
    
    const response: MangaDexResponse = await httpsGet(url);

    if (!response.data || response.data.length === 0) {
      console.log(`MangaDex: No results found for: ${title}`);
      return null;
    }

    // Get the first result (best match)
    const manga = response.data[0];
    
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
