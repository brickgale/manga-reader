import { Router } from 'express'
import { prisma } from '../index'
import { getPagination, buildPaginatedResponse } from '../utils/pagination'

const router = Router()

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: Get all bookmarks
 *     tags: [Bookmarks]
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
 *         description: Paginated list of bookmarks
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

    const [bookmarks, count] = await Promise.all([
      prisma.bookmark.findMany({
        include: {
          manga: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: paginationParams.skip,
        take: paginationParams.take,
      }),
      prisma.bookmark.count(),
    ])

    totalItems = count
    const response = buildPaginatedResponse(bookmarks, totalItems, page, pageSize)
    res.json(response)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' })
  }
})

/**
 * @swagger
 * /bookmarks/manga/{mangaId}:
 *   get:
 *     summary: Get bookmarks for a specific manga
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: Bookmarks for the manga
 *       500:
 *         description: Server error
 */
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        mangaId: req.params.mangaId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    res.json(bookmarks)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga bookmarks' })
  }
})

/**
 * @swagger
 * /bookmarks:
 *   post:
 *     summary: Create a bookmark
 *     tags: [Bookmarks]
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
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bookmark created
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  const { mangaId, chapterPath, pageNumber, note } = req.body

  if (!mangaId || !chapterPath || pageNumber === undefined) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const bookmark = await prisma.bookmark.create({
      data: {
        mangaId,
        chapterPath,
        pageNumber,
        note,
      },
    })
    res.json(bookmark)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bookmark' })
  }
})

/**
 * @swagger
 * /bookmarks/{id}:
 *   put:
 *     summary: Update a bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bookmark ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bookmark updated
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  const { note } = req.body

  try {
    const bookmark = await prisma.bookmark.update({
      where: { id: req.params.id },
      data: { note },
    })
    res.json(bookmark)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bookmark' })
  }
})

/**
 * @swagger
 * /bookmarks/{id}:
 *   delete:
 *     summary: Delete a bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bookmark ID
 *     responses:
 *       200:
 *         description: Bookmark deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.bookmark.delete({
      where: { id: req.params.id },
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bookmark' })
  }
})

export default router
