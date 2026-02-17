import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import mangaRoutes from './routes/manga'
import historyRoutes from './routes/history'
import bookmarkRoutes from './routes/bookmark'
import progressRoutes from './routes/progress'
import path from 'path'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

export const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/manga', mangaRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/progress', progressRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    mangaStoragePath: process.env.MANGA_STORAGE_PATH || '/manga',
  })
})

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')))

// Catch-all route for SPA - serve index.html for all non-API routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'))
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
