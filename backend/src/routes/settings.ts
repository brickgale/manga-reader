import { Router } from 'express'
import { prisma } from '../index'

const router = Router()

const VALID_THEMES = ['dark', 'light', 'auto']
const VALID_READING_DIRECTIONS = ['ltr', 'rtl']
const VALID_PAGE_FIT_MODES = ['fit-width', 'fit-height', 'original']

const ALLOWED_SETTINGS_FIELDS: Record<string, (value: unknown) => boolean> = {
  theme: (v) => typeof v === 'string' && VALID_THEMES.includes(v),
  enableChapterView: (v) => typeof v === 'boolean',
  enableSideReader: (v) => typeof v === 'boolean',
  showPageNumbers: (v) => typeof v === 'boolean',
  readingDirection: (v) => typeof v === 'string' && VALID_READING_DIRECTIONS.includes(v),
  pageFitMode: (v) => typeof v === 'string' && VALID_PAGE_FIT_MODES.includes(v),
  preloadNextPages: (v) => typeof v === 'number' && Number.isInteger(v) && (v as number) >= 0,
  autoMarkAsRead: (v) => typeof v === 'boolean',
  defaultPageSize: (v) => typeof v === 'number' && Number.isInteger(v) && (v as number) > 0,
}

function validateSettingsBody(body: Record<string, unknown>): { valid: boolean; error?: string; data?: Record<string, unknown> } {
  const unknownKeys = Object.keys(body).filter((k) => !(k in ALLOWED_SETTINGS_FIELDS))
  if (unknownKeys.length > 0) {
    return { valid: false, error: `Unknown fields: ${unknownKeys.join(', ')}` }
  }

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_SETTINGS_FIELDS[key](value)) {
      return { valid: false, error: `Invalid value for field: ${key}` }
    }
  }

  return { valid: true, data: body }
}

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
    const validation = validateSettingsBody(req.body)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      update: validation.data!,
      create: { id: 1, ...validation.data },
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
    const validation = validateSettingsBody(req.body)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      update: validation.data!,
      create: { id: 1, ...validation.data },
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
    // Reset to default values using upsert so the operation is idempotent
    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {
        theme: 'dark',
        enableChapterView: true,
        enableSideReader: false,
        showPageNumbers: true,
        readingDirection: 'ltr',
        pageFitMode: 'fit-width',
        preloadNextPages: 3,
        autoMarkAsRead: true,
        defaultPageSize: 20,
      },
      create: {
        id: 1,
        theme: 'dark',
        enableChapterView: true,
        enableSideReader: false,
        showPageNumbers: true,
        readingDirection: 'ltr',
        pageFitMode: 'fit-width',
        preloadNextPages: 3,
        autoMarkAsRead: true,
        defaultPageSize: 20,
      },
    })
    
    res.json(settings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset settings' })
  }
})

export default router
