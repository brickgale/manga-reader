# Manga Reader

A simple manga/manhwa reader application with reading history, bookmarks, and progress tracking.

![Manga Reader Preview](/frontend/public/images/preview-mangareader.png)

## Features

- 📁 Browse and scan local manga directories
- � Search manga by title with debounced search
- 📖 Read manga with page navigation
- 📚 Reading history tracking
- 🔖 Page bookmarks
- 📊 Progress tracking
- 🎨 Dark/Light theme support

## Requirements

- Docker & Docker Compose
- Your manga files in a directory (default: `/mnt/d/Manhwa`)

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd manga-reader
   ```

2. **Configure manga storage path**

   Create `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your manga directory:

   ```bash
   MANGA_STORAGE_PATH=/path/to/your/manga
   ```

   Default is `/mnt/d/Manhwa`

3. **Build and start**

   ```bash
   docker compose build
   docker compose up -d
   ```

4. **Access the application**

   Open your browser: `http://localhost:3000`

## Usage

1. Click "Scan Directory" button on the home page
2. The input will be pre-filled with `/manga` (your mounted storage path)
3. Click "Scan" to import your manga
4. Start reading!

## Stopping the Application

```bash
docker compose down
```

## Development

### Version Management

The application version is displayed in the Settings drawer. To update the version:

**Option 1: Using the sync script (recommended)**

```bash
# Sync frontend to match backend version
node sync-version.js

# Update both to a new version
node sync-version.js 1.2.0
```

**Option 2: Manual update**

1. Update `backend/package.json` version
2. Update `frontend/package.json` version (must match)
3. Rebuild and restart the backend:
   ```bash
   docker-compose build backend
   docker-compose up -d backend
   ```

**Version validation:**

- Backend validates version sync at startup (when frontend package.json is accessible)
- If versions don't match, a warning is logged to help catch inconsistencies
- The backend version is considered the source of truth
- In Docker, validation may not run since frontend/backend are separate containers

## Tech Stack

- **Backend**: Node.js, Express, Prisma, SQLite
- **Frontend**: Vue 3, Vite, Tailwind CSS
- **Infrastructure**: Docker, Docker Compose

## Project Structure

```
manga-reader/
├── backend/          # Backend API server
├── frontend/         # Vue frontend application
├── storage/          # Data storage (covers, etc.)
│   └── images/       # Downloaded cover images
├── docker-compose.yml
└── README.md
```

For detailed information about the backend or frontend, see their respective README files:

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Nginx Documentation](./docker/nginx/README.md)

## License

MIT
