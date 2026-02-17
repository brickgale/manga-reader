import { Router } from 'express'
import { prisma } from '../index'
import { getPagination, buildPaginatedResponse } from '../utils/pagination'

const router = Router()

// Get all bookmarks
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

// Get bookmarks for a specific manga
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

// Create bookmark
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

// Update bookmark
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

// Delete bookmark
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
