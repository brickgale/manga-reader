import { Router } from 'express';
import { prisma } from '../index';
import { promises as fs } from 'fs';
import path from 'path';
import { searchMangaBatch } from '../services/mangadex';

const router = Router();

// Get all manga from database
router.get('/', async (req, res) => {
  try {
    const manga = await prisma.manga.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(manga);
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
        path: path.join(manga.path, entry.name)
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

    const chapterPath = decodeURIComponent(req.params.chapterPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const entries = await fs.readdir(chapterPath, { withFileTypes: true });
    const pages = entries
      .filter(entry => 
        entry.isFile() && 
        imageExtensions.includes(path.extname(entry.name).toLowerCase())
      )
      .map(entry => ({
        name: entry.name,
        path: path.join(chapterPath, entry.name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get image file
router.get('/image', async (req, res) => {
  try {
    const { imagePath } = req.query;
    
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
    res.status(500).json({ error: 'Failed to load image' });
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
