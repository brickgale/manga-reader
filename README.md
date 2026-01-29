# Manga Reader


A simple manga/manhwa reader application with reading history, bookmarks, and progress tracking.

![Manga Reader Preview](/frontend/public/images/preview-mangareader.png)

## Features

- 📁 Browse and scan local manga directories
- 📖 Read manga with page navigation
- 📚 Reading history tracking
- 🔖 Page bookmarks
- 📊 Progress tracking

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
