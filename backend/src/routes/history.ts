import { Router } from 'express'
import { prisma } from '../index'
import { getPagination, buildPaginatedResponse } from '../utils/pagination'

const router = Router()

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get reading history
 *     tags: [History]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated reading history
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const pagination = getPagination(req.query, { defaultPageSize: 20 })

    let paginationParams = { skip: 0, take: 50 }
    let totalItems = 0
    let page = 1
    let pageSize = 50

    if (pagination) {
      paginationParams = { skip: pagination.skip, take: pagination.take }
      page = pagination.page
      pageSize = pagination.pageSize
    }

    const [history, count] = await Promise.all([
      prisma.readingHistory.findMany({
        include: {
          manga: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip: paginationParams.skip,
        take: paginationParams.take,
      }),
      prisma.readingHistory.count(),
    ])

    totalItems = count
    const response = buildPaginatedResponse(history, totalItems, page, pageSize)
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

/**
 * @swagger
 * /history/manga/{mangaId}:
 *   get:
 *     summary: Get history for a specific manga
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: History entries for the manga
 *       500:
 *         description: Server error
 */
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const history = await prisma.readingHistory.findMany({
      where: {
        mangaId: req.params.mangaId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })
    res.json(history)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga history' })
  }
})

/**
 * @swagger
 * /history:
 *   post:
 *     summary: Add or update history entry
 *     tags: [History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mangaId
 *               - chapterPath
 *               - pageNumber
 *             properties:
 *               mangaId:
 *                 type: string
 *               chapterPath:
 *                 type: string
 *               pageNumber:
 *                 type: integer
 *     responses:
 *       200:
 *         description: History entry created/updated
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  const { mangaId, chapterPath, pageNumber } = req.body

  if (!mangaId || !chapterPath || pageNumber === undefined) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Find existing history entry for this manga
    const existing = await prisma.readingHistory.findFirst({
      where: { mangaId },
    })

    let history
    if (existing) {
      // Update existing entry
      history = await prisma.readingHistory.update({
        where: { id: existing.id },
        data: {
          chapterPath,
          pageNumber,
          timestamp: new Date(),
        },
      })
    } else {
      // Create new entry
      history = await prisma.readingHistory.create({
        data: {
          mangaId,
          chapterPath,
          pageNumber,
        },
      })
    }
    res.json(history)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create history entry' })
  }
})

/**
 * @swagger
 * /history/{id}:
 *   delete:
 *     summary: Delete history entry
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: History entry ID
 *     responses:
 *       200:
 *         description: History entry deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.readingHistory.delete({
      where: { id: req.params.id },
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history entry' })
  }
})

export default router
