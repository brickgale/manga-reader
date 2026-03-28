#!/usr/bin/env tsx

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the database path from environment variable
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'
const dbPath = databaseUrl.replace('file:', '')

// Resolve paths
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const backupDir = path.join(projectRoot, 'backups')
const resolvedDbPath = path.isAbsolute(dbPath) ? dbPath : path.join(projectRoot, dbPath)

async function ensureBackupDir() {
  try {
    await fs.mkdir(backupDir, { recursive: true })
  } catch (error) {
    console.error('Failed to create backup directory:', error)
    throw error
  }
}

async function backup() {
  try {
    await ensureBackupDir()

    // Check if database exists
    try {
      await fs.access(resolvedDbPath)
    } catch {
      console.error(`Database not found at: ${resolvedDbPath}`)
      process.exit(1)
    }

    // Create timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupFileName = `backup-${timestamp}.db`
    const backupPath = path.join(backupDir, backupFileName)

    // Copy database file
    await fs.copyFile(resolvedDbPath, backupPath)

    console.log('✓ Database backup created successfully!')
    console.log(`  Location: ${backupPath}`)
    console.log(`  Size: ${(await fs.stat(backupPath)).size} bytes`)

    // List existing backups
    await listBackups()
  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  }
}

async function restore(backupFile?: string) {
  try {
    await ensureBackupDir()

    // Get list of backups
    const files = await fs.readdir(backupDir)
    const backups = files
      .filter((f: string) => f.startsWith('backup-') && f.endsWith('.db'))
      .sort()
      .reverse()

    if (backups.length === 0) {
      console.error('No backups found in:', backupDir)
      process.exit(1)
    }

    let selectedBackup: string

    if (backupFile) {
      // Use specified backup file
      if (!backups.includes(backupFile)) {
        console.error(`Backup file not found: ${backupFile}`)
        console.log('\nAvailable backups:')
        backups.forEach((backup: string, index: number) => {
          console.log(`  ${index + 1}. ${backup}`)
        })
        process.exit(1)
      }
      selectedBackup = backupFile
    } else {
      // Use most recent backup
      selectedBackup = backups[0]
      console.log(`Using most recent backup: ${selectedBackup}`)
    }

    const backupPath = path.join(backupDir, selectedBackup)

    // Create a backup of current database before restoring
    const currentDbExists = await fs
      .access(resolvedDbPath)
      .then(() => true)
      .catch(() => false)

    if (currentDbExists) {
      const preRestoreBackup = `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.db`
      const preRestorePath = path.join(backupDir, preRestoreBackup)
      await fs.copyFile(resolvedDbPath, preRestorePath)
      console.log(`✓ Current database backed up to: ${preRestoreBackup}`)
    }

    // Restore from backup
    await fs.copyFile(backupPath, resolvedDbPath)

    console.log('✓ Database restored successfully!')
    console.log(`  From: ${selectedBackup}`)
    console.log(`  To: ${resolvedDbPath}`)
  } catch (error) {
    console.error('Restore failed:', error)
    process.exit(1)
  }
}

async function listBackups() {
  try {
    await ensureBackupDir()

    const files = await fs.readdir(backupDir)
    const backups = files
      .filter((f: string) => f.startsWith('backup-') && f.endsWith('.db'))
      .sort()
      .reverse()

    if (backups.length === 0) {
      console.log('\nNo backups found.')
      return
    }

    console.log(`\nAvailable backups (${backups.length}):`)
    for (const backup of backups) {
      const backupPath = path.join(backupDir, backup)
      const stats = await fs.stat(backupPath)
      const size = (stats.size / 1024).toFixed(2)
      const date = stats.mtime.toLocaleString()
      console.log(`  • ${backup}`)
      console.log(`    Size: ${size} KB | Modified: ${date}`)
    }
  } catch (error) {
    console.error('Failed to list backups:', error)
    process.exit(1)
  }
}

async function cleanOldBackups(keepCount: number = 10) {
  try {
    await ensureBackupDir()

    const files = await fs.readdir(backupDir)
    const backups = files
      .filter((f: string) => f.startsWith('backup-') && f.endsWith('.db'))
      .sort()
      .reverse()

    if (backups.length <= keepCount) {
      console.log(`Only ${backups.length} backups found. Nothing to clean.`)
      return
    }

    const toDelete = backups.slice(keepCount)
    console.log(`Removing ${toDelete.length} old backups (keeping ${keepCount} most recent)...`)

    for (const backup of toDelete) {
      const backupPath = path.join(backupDir, backup)
      await fs.unlink(backupPath)
      console.log(`  ✗ Deleted: ${backup}`)
    }

    console.log('✓ Cleanup complete!')
  } catch (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const command = process.argv[2]
const arg = process.argv[3]

switch (command) {
  case 'backup':
    backup()
    break
  case 'restore':
    restore(arg)
    break
  case 'list':
    listBackups()
    break
  case 'clean': {
    const keepCount = arg === undefined ? 10 : Number(arg)
    if (!Number.isFinite(keepCount) || !Number.isInteger(keepCount) || keepCount <= 0) {
      console.error('Invalid count for db:clean. It must be a positive integer.')
      console.log('')
      console.log('Usage:')
      console.log('  npm run db:clean [count]    Keep only the N most recent backups (default: 10)')
      process.exit(1)
    }
    cleanOldBackups(keepCount)
    break
  }
  default:
    console.log('Database Backup Utility')
    console.log('')
    console.log('Usage:')
    console.log('  npm run db:backup           Create a new backup')
    console.log('  npm run db:restore          Restore from most recent backup')
    console.log('  npm run db:restore [file]   Restore from specific backup file')
    console.log('  npm run db:list             List all available backups')
    console.log('  npm run db:clean [count]    Keep only the N most recent backups (default: 10)')
    console.log('')
    console.log('Environment:')
    console.log(`  DATABASE_URL: ${databaseUrl}`)
    console.log(`  Database path: ${resolvedDbPath}`)
    console.log(`  Backup directory: ${backupDir}`)
    process.exit(command ? 1 : 0)
}
