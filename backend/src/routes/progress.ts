import { Router } from 'express'
import { prisma } from '../index'

const router = Router()

// Get progress for a manga
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const progress = await prisma.readingProgress.findUnique({
      where: {
        mangaId: req.params.mangaId,
      },
    })
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})

// Update or create progress
router.post('/', async (req, res) => {
  const { mangaId, chapterPath, pageNumber } = req.body

  if (!mangaId || !chapterPath || pageNumber === undefined) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Get existing progress
    const existingProgress = await prisma.readingProgress.findUnique({
      where: { mangaId },
    })

    let farthestChapterPath = chapterPath
    let farthestPageNumber = pageNumber

    // Compare and update farthest progress if current is further
    if (existingProgress) {
      // Simple comparison: if chapter path is "greater" or same chapter with higher page
      const isFarther =
        chapterPath > existingProgress.farthestChapterPath ||
        (chapterPath === existingProgress.farthestChapterPath &&
          pageNumber > existingProgress.farthestPageNumber)

      if (isFarther) {
        farthestChapterPath = chapterPath
        farthestPageNumber = pageNumber
      } else {
        farthestChapterPath = existingProgress.farthestChapterPath
        farthestPageNumber = existingProgress.farthestPageNumber
      }
    }

    const progress = await prisma.readingProgress.upsert({
      where: { mangaId },
      update: {
        lastChapterPath: chapterPath,
        lastPageNumber: pageNumber,
        farthestChapterPath,
        farthestPageNumber,
      },
      create: {
        mangaId,
        lastChapterPath: chapterPath,
        lastPageNumber: pageNumber,
        farthestChapterPath: chapterPath,
        farthestPageNumber: pageNumber,
      },
    })

    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' })
  }
})

export default router
