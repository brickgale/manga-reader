# Manga Reader

A simple manga/manhwa previewer and reader application with reading history, bookmarks, and progress tracking.

## Features

- 📁 Browse local manga folders
- 📖 Read manga with simple page navigation
- 📚 Track reading history
- 🔖 Bookmark specific pages
- 📊 Track reading progress (last read and farthest page)
- 🗄️ SQLite database for data persistence

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite Database

### Frontend
- Vue 3
- Vite
- TypeScript
- Tailwind CSS
- Vue Router

## Project Structure

```
manga-reader/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── routes/            # API routes
│   │   └── index.ts           # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── views/             # Vue pages
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
└── README.md
```

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Database**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

## Usage

1. **Scan a Directory**
   - On the home page, enter the full path to your manga directory
   - Click "Scan Directory" to import manga folders
   - The scanner will detect subdirectories as manga titles

2. **Read Manga**
   - Click on a manga to view its chapters
   - Select a chapter to start reading
   - Click on pages or use navigation buttons to move between pages
   - Progress is automatically tracked

3. **View History**
   - Navigate to the History page to see your recent reading activity

4. **Manage Bookmarks**
   - While reading, click the bookmark button to save your current page
   - View all bookmarks on the Bookmarks page

## API Endpoints

### Manga
- `GET /api/manga` - Get all manga
- `POST /api/manga/scan` - Scan a directory for manga
- `GET /api/manga/:id/chapters` - Get chapters for a manga
- `GET /api/manga/:id/chapters/:chapterPath/pages` - Get pages for a chapter
- `GET /api/manga/image?imagePath=<path>` - Get image file

### History
- `GET /api/history` - Get reading history
- `GET /api/history/manga/:mangaId` - Get history for specific manga
- `POST /api/history` - Add history entry
- `DELETE /api/history/:id` - Delete history entry

### Bookmarks
- `GET /api/bookmarks` - Get all bookmarks
- `GET /api/bookmarks/manga/:mangaId` - Get bookmarks for specific manga
- `POST /api/bookmarks` - Create bookmark
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark

### Progress
- `GET /api/progress/manga/:mangaId` - Get reading progress for manga
- `POST /api/progress` - Update reading progress

## Database Schema

### Models
- **Manga** - Stores manga information
- **ReadingHistory** - Tracks each reading session
- **Bookmark** - Stores user bookmarks
- **ReadingProgress** - Tracks current and farthest reading position

## Development

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

## License

MIT
