import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get reading history
router.get('/', async (req, res) => {
  try {
    const history = await prisma.readingHistory.findMany({
      include: {
        manga: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get history for a specific manga
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const history = await prisma.readingHistory.findMany({
      where: {
        mangaId: req.params.mangaId
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga history' });
  }
});

// Add history entry
router.post('/', async (req, res) => {
  const { mangaId, chapterPath, pageNumber } = req.body;

  if (!mangaId || !chapterPath || pageNumber === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const history = await prisma.readingHistory.create({
      data: {
        mangaId,
        chapterPath,
        pageNumber
      }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create history entry' });
  }
});

// Delete history entry
router.delete('/:id', async (req, res) => {
  try {
    await prisma.readingHistory.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

export default router;
