import { Router } from 'express';
import { prisma } from '../index';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

const router = Router();

// Get reading history
router.get('/', async (req, res) => {
  try {
    const pagination = getPagination(req.query, { defaultPageSize: 20 });
    
    let paginationParams = { skip: 0, take: 50 };
    let totalItems = 0;
    let page = 1;
    let pageSize = 50;

    if (pagination) {
      paginationParams = { skip: pagination.skip, take: pagination.take };
      page = pagination.page;
      pageSize = pagination.pageSize;
    }

    const [history, count] = await Promise.all([
      prisma.readingHistory.findMany({
        include: {
          manga: true
        },
        orderBy: {
          timestamp: 'desc'
        },
        skip: paginationParams.skip,
        take: paginationParams.take
      }),
      prisma.readingHistory.count()
    ]);

    totalItems = count;
    const response = buildPaginatedResponse(history, totalItems, page, pageSize);
    res.json(response);
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

// Add or update history entry
router.post('/', async (req, res) => {
  const { mangaId, chapterPath, pageNumber } = req.body;

  if (!mangaId || !chapterPath || pageNumber === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const history = await prisma.readingHistory.upsert({
      where: { mangaId },
      update: {
        chapterPath,
        pageNumber,
        timestamp: new Date()
      },
      create: {
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
