import { Router } from 'express';
import { prisma } from '../index';
import { promises as fs } from 'fs';
import path from 'path';
import { searchMangaBatch, getMangaByMangaDexId } from '../services/mangadex';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

const router = Router();

// Get all manga from database
router.get('/', async (req, res) => {
  try {
    const pagination = getPagination(req.query, { defaultPageSize: 20 });
    
    if (!pagination) {
      // No pagination params, return all
      const manga = await prisma.manga.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      const totalItems = manga.length;
      const pageSize = totalItems === 0 ? 1 : manga.length;
      const response = buildPaginatedResponse(manga, totalItems, 1, pageSize);
      return res.json(response);
    }

    const [manga, totalItems] = await Promise.all([
      prisma.manga.findMany({
        orderBy: { updatedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take
      }),
      prisma.manga.count()
    ]);

    const response = buildPaginatedResponse(manga, totalItems, pagination.page, pagination.pageSize);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

// Scan a directory and add manga
router.post('/scan', async (req, res) => {
  const { dirPath } = req.body;

  if (!dirPath) {
    return res.status(400).json({ error: 'Directory path is required' });
  }

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());

    // Extract titles for batch processing
    const titles = directories.map(dir => dir.name);
    
    console.log(`Found ${titles.length} directories.`);
    
    // Fetch metadata from Kitsu API in batches
    let metadataMap = new Map<string, any>();
    
    if (titles.length > 0) {
      console.log('Fetching metadata from Kitsu API in batches...');
      try {
        metadataMap = await searchMangaBatch(titles);
        console.log('Metadata fetched successfully.');
      } catch (apiError) {
        console.error('Failed to fetch metadata from Kitsu API:', apiError);
        console.log('Continuing with local directory names...');
      }
    }

    const mangaList = [];

    for (const dir of directories) {
      const mangaPath = path.join(dirPath, dir.name);
      const metadata = metadataMap.get(dir.name);
      
      // Check for local cover image in manga folder
      let localCoverPath: string | null = null;
      const possibleCovers = ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp'];
      
      for (const coverName of possibleCovers) {
        const coverPath = path.join(mangaPath, coverName);
        try {
          await fs.access(coverPath);
          localCoverPath = coverPath;
          console.log(`Found local cover: ${coverName} for ${dir.name}`);
          break;
        } catch {
          // Cover doesn't exist, try next
        }
      }
      
      // Check if manga already exists
      let manga = await prisma.manga.findUnique({
        where: { path: mangaPath }
      });

      // Only use local covers - filter out external URLs
      const coverToSave = localCoverPath || 
                          (metadata?.coverImage && !metadata.coverImage.startsWith('http') ? metadata.coverImage : null);

      if (!manga) {
        // Create new manga - only with local covers
        manga = await prisma.manga.create({
          data: {
            title: metadata?.title || dir.name,
            path: mangaPath,
            coverImage: coverToSave
          }
        });
        console.log(`Created: ${manga.title}${localCoverPath ? ' (with local cover)' : coverToSave ? ' (with downloaded cover)' : ' (no cover)'}`);
      } else {
        // Update existing manga - prefer local covers, remove external URLs
        const hasExternalUrl = manga.coverImage?.startsWith('http');
        const shouldUpdate = localCoverPath || !manga.coverImage || hasExternalUrl;
        
        if (shouldUpdate) {
          manga = await prisma.manga.update({
            where: { id: manga.id },
            data: {
              coverImage: coverToSave,
              title: metadata?.title || manga.title
            }
          });
          console.log(`Updated: ${manga.title} with ${localCoverPath ? 'local cover' : coverToSave ? 'downloaded cover' : 'no cover (removed external URL)'}`);
        }
      }

      mangaList.push(manga);
    }

    console.log(`Scan complete! Processed ${mangaList.length} manga.`);
    res.json(mangaList);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Failed to scan directory' });
  }
});

// Refresh metadata for existing manga
router.post('/refresh-metadata', async (req, res) => {
  try {
    const { mangaIds } = req.body; // Optional: array of specific manga IDs to refresh
    
    // Get manga to refresh
    let mangaList;
    if (mangaIds && Array.isArray(mangaIds) && mangaIds.length > 0) {
      mangaList = await prisma.manga.findMany({
        where: { id: { in: mangaIds } }
      });
      console.log(`Refreshing metadata for ${mangaList.length} specific manga...`);
    } else {
      mangaList = await prisma.manga.findMany();
      console.log(`Refreshing metadata for all ${mangaList.length} manga...`);
    }

    if (mangaList.length === 0) {
      return res.json({ message: 'No manga to refresh', updated: [] });
    }

    // Extract titles from directory names for batch processing
    const titleMap = new Map<string, { id: string; path: string }>();
    
    for (const manga of mangaList) {
      const dirName = path.basename(manga.path);
      titleMap.set(dirName, { id: manga.id, path: manga.path });
    }
    
    const titles = Array.from(titleMap.keys());
    
    // Fetch updated metadata from APIs
    let metadataMap = new Map<string, any>();
    
    if (titles.length > 0) {
      console.log('Fetching updated metadata from APIs...');
      try {
        metadataMap = await searchMangaBatch(titles);
        console.log('Metadata fetched successfully.');
      } catch (apiError) {
        console.error('Failed to fetch metadata:', apiError);
        return res.status(500).json({ error: 'Failed to fetch metadata from APIs' });
      }
    }

    const updatedManga = [];

    for (const [dirName, mangaInfo] of titleMap.entries()) {
      const metadata = metadataMap.get(dirName);
      const mangaPath = mangaInfo.path;
      
      // Check for local cover image in manga folder
      let localCoverPath: string | null = null;
      const possibleCovers = ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp'];
      
      for (const coverName of possibleCovers) {
        const coverPath = path.join(mangaPath, coverName);
        try {
          await fs.access(coverPath);
          localCoverPath = coverPath;
          console.log(`Found local cover: ${coverName} for ${dirName}`);
          break;
        } catch {
          // Cover doesn't exist, try next
        }
      }
      
      // Prefer local covers, then downloaded covers (but not external URLs)
      const coverToSave = localCoverPath || 
                          (metadata?.coverImage && !metadata.coverImage.startsWith('http') ? metadata.coverImage : null);

      // Update the manga with new metadata
      const updated = await prisma.manga.update({
        where: { id: mangaInfo.id },
        data: {
          title: metadata?.title || dirName,
          coverImage: coverToSave,
          updatedAt: new Date()
        }
      });

      console.log(`Updated: ${updated.title}${localCoverPath ? ' (with local cover)' : coverToSave ? ' (with downloaded cover)' : ' (no cover)'}`);
      updatedManga.push(updated);
    }

    console.log(`Refresh complete! Updated ${updatedManga.length} manga.`);
    res.json({ 
      message: `Successfully refreshed ${updatedManga.length} manga`, 
      updated: updatedManga 
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh metadata' });
  }
});

// Manually update manga metadata using MangaDex ID or URL
router.post('/update-metadata/:id', async (req, res) => {
  try {
    const { mangadexId } = req.body;
    
    if (!mangadexId) {
      return res.status(400).json({ error: 'MangaDex ID or URL is required' });
    }

    // Check if manga exists
    const manga = await prisma.manga.findUnique({
      where: { id: req.params.id }
    });

    if (!manga) {
      return res.status(404).json({ error: 'Manga not found' });
    }

    console.log(`Manually updating manga ${manga.path} with MangaDex ID: ${mangadexId}`);

    // Fetch metadata from MangaDex by ID
    const metadata = await getMangaByMangaDexId(mangadexId);

    if (!metadata) {
      return res.status(404).json({ error: 'MangaDex manga not found or failed to fetch' });
    }

    // Check for local cover image in manga folder
    let localCoverPath: string | null = null;
    const possibleCovers = ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp'];
    
    for (const coverName of possibleCovers) {
      const coverPath = path.join(manga.path, coverName);
      try {
        await fs.access(coverPath);
        localCoverPath = coverPath;
        console.log(`Found local cover: ${coverName}`);
        break;
      } catch {
        // Cover doesn't exist, try next
      }
    }
    
    // Prefer local covers, then downloaded covers (but not external URLs)
    const coverToSave = localCoverPath || 
                        (metadata.coverImage && !metadata.coverImage.startsWith('http') ? metadata.coverImage : null);

    // Update the manga with new metadata
    const updated = await prisma.manga.update({
      where: { id: req.params.id },
      data: {
        title: metadata.title,
        coverImage: coverToSave,
        updatedAt: new Date()
      }
    });

    console.log(`Manually updated: ${updated.title}${localCoverPath ? ' (with local cover)' : coverToSave ? ' (with downloaded cover)' : ' (no cover)'}`);
    
    res.json({ 
      message: 'Successfully updated manga metadata', 
      manga: updated 
    });
  } catch (error) {
    console.error('Manual update error:', error);
    res.status(500).json({ error: 'Failed to update manga metadata' });
  }
});

// Get chapters for a manga
router.get('/:id/chapters', async (req, res) => {
  try {
    const manga = await prisma.manga.findUnique({
      where: { id: req.params.id }
    });

    if (!manga) {
      return res.status(404).json({ error: 'Manga not found' });
    }

    const entries = await fs.readdir(manga.path, { withFileTypes: true });
    const chapters = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        name: entry.name,
        path: entry.name
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Get pages for a chapter
router.get('/:id/chapters/:chapterPath/pages', async (req, res) => {
  try {
    const manga = await prisma.manga.findUnique({
      where: { id: req.params.id }
    });

    if (!manga) {
      return res.status(404).json({ error: 'Manga not found' });
    }

    const chapterName = decodeURIComponent(req.params.chapterPath);
    const fullChapterPath = path.join(manga.path, chapterName);
    console.log('[DEBUG] pages API - chapterName:', chapterName);
    console.log('[DEBUG] pages API - fullChapterPath:', fullChapterPath);
    // Early debug response
    // return res.json({ debug: 'chapterPath', value: chapterPath });

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const entries = await fs.readdir(fullChapterPath, { withFileTypes: true });
    const pages = entries
      .filter(entry => 
        entry.isFile() && 
        imageExtensions.includes(path.extname(entry.name).toLowerCase())
      )
      .map(entry => ({
        name: entry.name,
        path: path.join(fullChapterPath, entry.name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    console.log('[DEBUG] pages API - pages:', pages.map(p => p.path));
    res.json(pages);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DEBUG] pages API error:', message);
    res.status(500).json({ error: 'Failed to fetch pages', debug: message });
  }
});

// Get image file
router.get('/image', async (req, res) => {
  try {
    const { imagePath } = req.query;
    console.log('[DEBUG] image API - imagePath:', imagePath);
    if (!imagePath || typeof imagePath !== 'string') {
      return res.status(400).json({ error: 'Image path is required' });
    }

    const imageBuffer = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const contentType: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    res.set('Content-Type', contentType[ext] || 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DEBUG] image API error:', message);
    res.status(500).json({ error: 'Failed to load image', debug: message });
  }
});

// Serve cover images
router.get('/covers/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const coverPath = path.join(process.cwd(), 'images', 'covers', filename);
    
    const imageBuffer = await fs.readFile(coverPath);
    const ext = path.extname(filename).toLowerCase();
    
    const contentType: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    res.set('Content-Type', contentType[ext] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(imageBuffer);
  } catch (error) {
    res.status(404).json({ error: 'Cover image not found' });
  }
});

export default router;
