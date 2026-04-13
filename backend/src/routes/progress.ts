import { Router } from 'express'
import { prisma } from '../index'
import { promises as fs } from 'fs'
import path from 'path'

const router = Router()

/**
 * @swagger
 * /progress/manga/{mangaId}:
 *   get:
 *     summary: Get reading progress for a manga
 *     tags: [Progress]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: Reading progress for the manga
 *       500:
 *         description: Server error
 */
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const progress = await prisma.readingProgress.findUnique({
      where: {
        mangaId: req.params.mangaId,
      },
    })

    if (!progress) {
      return res.json(null)
    }

    // Calculate overall progress percentage
    let overallProgress = 0

    try {
      const manga = await prisma.manga.findUnique({
        where: { id: req.params.mangaId },
      })

      if (manga) {
        // Get all chapters
        const entries = await fs.readdir(manga.path, { withFileTypes: true })
        const chapters = entries
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

        if (chapters.length > 0) {
          // Find the index of the farthest chapter
          const farthestChapterIndex = chapters.findIndex(ch => ch === progress.farthestChapterPath)

          if (farthestChapterIndex !== -1) {
            // Get pages in the farthest chapter to calculate progress within it
            const farthestChapterPath = path.join(manga.path, progress.farthestChapterPath)
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            const pageEntries = await fs.readdir(farthestChapterPath, { withFileTypes: true })
            const pages = pageEntries
              .filter(
                entry =>
                  entry.isFile() && imageExtensions.includes(path.extname(entry.name).toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

            if (pages.length > 0) {
              // Calculate: (completed chapters + progress in current chapter) / total chapters
              const completedChapters = farthestChapterIndex
              const currentChapterProgress = (progress.farthestPageNumber + 1) / pages.length
              const totalProgress = (completedChapters + currentChapterProgress) / chapters.length
              overallProgress = Math.min(Math.max(totalProgress * 100, 0), 100)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to calculate overall progress:', error)
      // If calculation fails, just set to 0 and continue
    }

    res.json({ ...progress, overallProgress })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})

/**
 * @swagger
 * /progress:
 *   post:
 *     summary: Update or create reading progress
 *     tags: [Progress]
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
 *         description: Progress updated/created
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
    // Get existing progress
    const existingProgress = await prisma.readingProgress.findUnique({
      where: { mangaId },
    })

    let farthestChapterPath = chapterPath
    let farthestPageNumber = pageNumber

    // Compare and update farthest progress if current is further
    if (existingProgress) {
      // Use localeCompare with numeric: true for proper numeric comparison
      // This correctly handles "Chapter 100" > "Chapter 99", etc.
      const chapterComparison = chapterPath.localeCompare(
        existingProgress.farthestChapterPath,
        undefined,
        { numeric: true, sensitivity: 'base' }
      )

      const isFarther =
        chapterComparison > 0 ||
        (chapterComparison === 0 && pageNumber > existingProgress.farthestPageNumber)

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
