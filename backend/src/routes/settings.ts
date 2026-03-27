import { Router } from 'express'
import { prisma } from '../index'

const router = Router()

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get application settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Application settings
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    // Get the singleton settings record (id is always 1)
    const settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
    })
    
    if (!settings) {
      return res.status(500).json({ error: 'Settings not initialized. Run database seed.' })
    }
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update application settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [dark, light, auto]
 *               enableChapterView:
 *                 type: boolean
 *               enableSideReader:
 *                 type: boolean
 *               showPageNumbers:
 *                 type: boolean
 *               readingDirection:
 *                 type: string
 *                 enum: [ltr, rtl]
 *               pageFitMode:
 *                 type: string
 *                 enum: [fit-width, fit-height, original]
 *               preloadNextPages:
 *                 type: integer
 *               autoMarkAsRead:
 *                 type: boolean
 *               defaultPageSize:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Settings updated
 *       500:
 *         description: Server error
 */
router.put('/', async (req, res) => {
  try {
    // Update the singleton settings record (id is always 1)
    const settings = await prisma.appSettings.update({
      where: { id: 1 },
      data: req.body,
    })
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

/**
 * @swagger
 * /settings:
 *   patch:
 *     summary: Partially update application settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [dark, light, auto]
 *               enableChapterView:
 *                 type: boolean
 *               enableSideReader:
 *                 type: boolean
 *               showPageNumbers:
 *                 type: boolean
 *               readingDirection:
 *                 type: string
 *                 enum: [ltr, rtl]
 *               pageFitMode:
 *                 type: string
 *                 enum: [fit-width, fit-height, original]
 *               preloadNextPages:
 *                 type: integer
 *               autoMarkAsRead:
 *                 type: boolean
 *               defaultPageSize:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Settings updated
 *       500:
 *         description: Server error
 */
router.patch('/', async (req, res) => {
  try {
    // Update the singleton settings record (id is always 1)
    const settings = await prisma.appSettings.update({
      where: { id: 1 },
      data: req.body,
    })
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

/**
 * @swagger
 * /settings/reset:
 *   post:
 *     summary: Reset settings to defaults
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings reset to defaults
 *       500:
 *         description: Server error
 */
router.post('/reset', async (req, res) => {
  try {
    // Reset to default values by deleting and recreating
    await prisma.appSettings.delete({
      where: { id: 1 },
    })
    
    const settings = await prisma.appSettings.create({
      data: {
        id: 1,
        // All fields will use their default values from the schema
      },
    })
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset settings' })
  }
})

export default router
