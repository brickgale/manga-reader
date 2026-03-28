# Backend - Manga Reader API

Express.js backend server providing REST API for manga management, reading history, bookmarks, and progress tracking.

## Tech Stack

- **Runtime**: Node.js 24
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Environment**: Docker

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── routes/
│   │   ├── manga.ts          # Manga endpoints
│   │   ├── history.ts        # Reading history endpoints
│   │   ├── bookmark.ts       # Bookmark endpoints
│   │   └── progress.ts       # Progress tracking endpoints
│   └── index.ts              # Express server entry point
├── images/
│   └── covers/               # Manga cover images
├── package.json
└── tsconfig.json
```

## Environment Variables

```bash
# Server configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=file:/data/dev.db

# Manga storage (inside container)
MANGA_STORAGE_PATH=/manga
```

## API Endpoints

### Configuration

- `GET /api/config` - Get server configuration
- `GET /api/health` - Health check

### Manga

- `GET /api/manga` - Get all manga
- `POST /api/manga/scan` - Scan directory for manga
  - Body: `{ "dirPath": "/manga" }`
- `GET /api/manga/:id/chapters` - Get chapters for a manga
- `GET /api/manga/:id/chapters/:chapterPath/pages` - Get pages for a chapter
- `GET /api/manga/image?imagePath=<path>` - Get image file

### Reading History

- `GET /api/history` - Get all reading history
- `GET /api/history/manga/:mangaId` - Get history for specific manga
- `POST /api/history` - Create history entry
  - Body: `{ "mangaId": "uuid", "chapterPath": "path", "pageNumber": 1 }`
- `DELETE /api/history/:id` - Delete history entry

### Bookmarks

- `GET /api/bookmarks` - Get all bookmarks
- `GET /api/bookmarks/manga/:mangaId` - Get bookmarks for specific manga
- `POST /api/bookmarks` - Create bookmark
  - Body: `{ "mangaId": "uuid", "chapterPath": "path", "pageNumber": 1, "note": "optional" }`
- `PUT /api/bookmarks/:id` - Update bookmark
  - Body: `{ "note": "updated note" }`
- `DELETE /api/bookmarks/:id` - Delete bookmark

### Progress Tracking

- `GET /api/progress/manga/:mangaId` - Get reading progress for manga
- `POST /api/progress` - Update reading progress
  - Body: `{ "mangaId": "uuid", "chapterPath": "path", "pageNumber": 1 }`

## Database Schema

### Manga

```prisma
model Manga {
  id          String   @id @default(uuid())
  title       String
  path        String   @unique
  coverImage  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ReadingHistory

```prisma
model ReadingHistory {
  id          String   @id @default(uuid())
  mangaId     String   @unique
  chapterPath String
  pageNumber  Int
  timestamp   DateTime @default(now()) @updatedAt
}
```

### Bookmark

```prisma
model Bookmark {
  id          String   @id @default(uuid())
  mangaId     String
  chapterPath String
  pageNumber  Int
  note        String?
  createdAt   DateTime @default(now())
}
```

### ReadingProgress

```prisma
model ReadingProgress {
  id                  String   @id @default(uuid())
  mangaId             String   @unique
  lastChapterPath     String
  lastPageNumber      Int
  farthestChapterPath String
  farthestPageNumber  Int
  updatedAt           DateTime @updatedAt
}
```

## Development

### Prerequisites

- Node.js 24+
- Docker (for production)

### Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup database**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

3. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations
- `npm run prisma:seed` - Seed the database with initial data (required for `/api/settings`)
- `npx prisma generate` - Generate Prisma Client

### Database Backup & Restore

The project includes a built-in database backup utility for SQLite:

- `npm run db:backup` - Create a timestamped backup of the database
- `npm run db:restore` - Restore from the most recent backup
- `npm run db:restore backup-2026-03-28T12-34-56.db` - Restore from a specific backup file
- `npm run db:list` - List all available backups with details
- `npm run db:clean` - Keep only the 10 most recent backups (delete older ones)
- `npm run db:clean 5` - Keep only the 5 most recent backups

**How it works:**

- Backups are stored in `backend/backups/` directory
- Backup files are named with timestamps: `backup-YYYY-MM-DDTHH-MM-SS.db`
- Before restoring, the current database is automatically backed up as `pre-restore-*.db`
- Backups are excluded from git (see `.gitignore`)

**Example workflow:**

```bash
# Create a backup before risky operations
npm run db:backup

# If something goes wrong, restore from backup
npm run db:restore

# Periodically clean old backups to save space
npm run db:clean 10
```

## Docker

The backend is containerized and runs as part of the Docker Compose setup.

### Container Details

- Base image: `node:24-alpine`
- Exposed port: `3000`
- Volume mounts:
  - `/data` - SQLite database
  - `/manga` - Manga storage (read-only)
  - `/app/frontend/dist` - Frontend build

### Build

```bash
docker compose build backend
```

## Dependencies

### Production

- `express` - Web framework
- `@prisma/client` - Database ORM
- `cors` - Cross-origin resource sharing

### Development

- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution engine
- `prisma` - Database toolkit
- `@types/*` - TypeScript type definitions

## Notes

- Database file is stored at `/data/dev.db` inside the container
- Manga files are mounted at `/manga` (read-only)
- Cover images are stored in `images/covers/`
- Migrations are automatically applied on container startup
