#!/usr/bin/env node

/**
 * Script to sync version across backend and frontend package.json files
 * Usage:
 *   node sync-version.js          # Sync frontend to match backend
 *   node sync-version.js 1.2.3    # Update both to version 1.2.3
 */

const fs = require('fs')
const path = require('path')

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
}

const log = {
  error: msg => console.error(`${colors.red}${msg}${colors.reset}`),
  success: msg => console.log(`${colors.green}${msg}${colors.reset}`),
  warn: msg => console.warn(`${colors.yellow}${msg}${colors.reset}`),
  info: msg => console.log(msg),
}

// File paths
const BACKEND_PKG = path.join(__dirname, 'backend', 'package.json')
const FRONTEND_PKG = path.join(__dirname, 'frontend', 'package.json')

// Read package.json files
function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    log.error(`Error reading ${filePath}: ${error.message}`)
    process.exit(1)
  }
}

// Write package.json files
function writePackageJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  } catch (error) {
    log.error(`Error writing ${filePath}: ${error.message}`)
    process.exit(1)
  }
}

// Validate semantic version format
function isValidVersion(version) {
  return /^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?(\+[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/.test(version)
}

// Main function
function main() {
  const backendPkg = readPackageJson(BACKEND_PKG)
  const frontendPkg = readPackageJson(FRONTEND_PKG)

  const backendVersion = backendPkg.version
  const frontendVersion = frontendPkg.version

  log.info('Current versions:')
  log.warn(`  Backend:  v${backendVersion}`)
  log.warn(`  Frontend: v${frontendVersion}`)
  log.info('')

  const newVersion = process.argv[2]

  if (!newVersion) {
    // No argument - sync frontend to backend
    if (backendVersion === frontendVersion) {
      log.success('✓ Versions are already in sync!')
      process.exit(0)
    }

    log.info(
      `Syncing frontend to backend version: ${colors.green}v${backendVersion}${colors.reset}`
    )
    frontendPkg.version = backendVersion
    writePackageJson(FRONTEND_PKG, frontendPkg)
    log.success('✓ Versions synced!')
  } else {
    // Version provided - update both
    if (!isValidVersion(newVersion)) {
      log.error('Error: Invalid version format. Use semantic versioning (e.g., 1.2.3)')
      process.exit(1)
    }

    log.info(`Updating both to: ${colors.green}v${newVersion}${colors.reset}`)

    backendPkg.version = newVersion
    frontendPkg.version = newVersion

    writePackageJson(BACKEND_PKG, backendPkg)
    writePackageJson(FRONTEND_PKG, frontendPkg)

    log.success(`✓ Both versions updated to v${newVersion}!`)
  }

  // Show final versions
  log.info('')
  log.info('New versions:')
  const updatedBackend = readPackageJson(BACKEND_PKG)
  const updatedFrontend = readPackageJson(FRONTEND_PKG)
  log.success(`  Backend:  v${updatedBackend.version}`)
  log.success(`  Frontend: v${updatedFrontend.version}`)
}

main()
