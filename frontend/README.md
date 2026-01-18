# Frontend - Manga Reader UI

Vue 3 frontend application for browsing and reading manga with a clean, responsive interface.

## Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **Router**: Vue Router 4
- **UI Components**: Radix UI (via reka-ui)
- **Icons**: Lucide Vue Next
- **HTTP Client**: Axios

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── index.ts          # API client & types
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── reader/           # Reader-specific components
│   │   ├── pagination/       # Pagination component
│   │   ├── Logo.vue
│   │   └── ThemeToggle.vue
│   ├── views/
│   │   ├── Home.vue          # Library & scan page
│   │   ├── MangaReader.vue   # Reading interface
│   │   ├── History.vue       # Reading history
│   │   └── Bookmarks.vue     # Saved bookmarks
│   ├── lib/
│   │   └── utils.ts          # Utility functions
│   ├── App.vue               # Root component
│   ├── main.ts               # Application entry
│   └── style.css             # Global styles
├── public/                   # Static assets
├── components.json           # UI components config
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts            # Vite configuration
└── package.json
```

## Key Features

### Pages

1. **Home** (`/`)
   - Manga library grid view
   - Directory scanning
   - Recently read manga section

2. **Manga Reader** (`/manga/:id`)
   - Chapter selection
   - Page-by-page reading
   - Keyboard navigation (arrow keys)
   - Progress tracking
   - Bookmark creation

3. **History** (`/history`)
   - Reading history timeline
   - Jump back to last read page
   - Clear history

4. **Bookmarks** (`/bookmarks`)
   - Saved page bookmarks
   - Notes on bookmarks
   - Quick navigation to bookmarked pages

### UI Components

- **Button** - Various button styles
- **Card** - Content containers
- **Input** - Form inputs
- **Select** - Dropdown selects
- **Tooltip** - Hover tooltips
- **Sonner** - Toast notifications
- **Pagination** - Page navigation

### Theme

- Light/Dark mode support
- Toggle via ThemeToggle component
- Persisted to localStorage

## Development

### Prerequisites
- Node.js 24+
- npm

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

Development server runs on `http://localhost:5173`

The app will proxy API requests to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Integration

The frontend communicates with the backend via REST API.

### API Client (`src/api/index.ts`)

```typescript
import { api } from '@/api'

// Get all manga
const manga = await api.getManga()

// Scan directory
const result = await api.scanDirectory('/manga')

// Get chapters
const chapters = await api.getChapters(mangaId)

// Get pages
const pages = await api.getPages(mangaId, chapterPath)

// Reading history
const history = await api.getHistory()
await api.createHistory({ mangaId, chapterPath, pageNumber })

// Bookmarks
const bookmarks = await api.getBookmarks()
await api.createBookmark({ mangaId, chapterPath, pageNumber, note })

// Progress
const progress = await api.getProgress(mangaId)
await api.updateProgress({ mangaId, chapterPath, pageNumber })
```

## Styling

### Tailwind CSS

The app uses Tailwind CSS with a custom configuration:

- Custom color palette (primary, secondary, accent, muted, etc.)
- Dark mode support
- Custom animations
- Responsive breakpoints

### CSS Variables

Theme colors are defined using CSS variables in `src/style.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 20 14.3% 4.1%;
  --primary: 24 9.8% 10%;
  /* ... */
}

.dark {
  --background: 20 14.3% 4.1%;
  --foreground: 60 9.1% 97.8%;
  /* ... */
}
```

## Docker

The frontend is built as a static site and served by the backend.

### Build Process
1. Dependencies are installed
2. Vite builds the production bundle
3. Output is placed in `/app/dist`
4. Backend serves the static files

### Container Details
- Base image: `node:24-alpine`
- Build output: `/app/dist`
- Served by backend on port 3000

## Dependencies

### Production
- `vue` - Framework
- `vue-router` - Routing
- `axios` - HTTP client
- `@vueuse/core` - Vue utilities
- `reka-ui` - UI components
- `lucide-vue-next` - Icons
- `vue-sonner` - Toast notifications
- `tailwindcss` - Styling
- `class-variance-authority` - Component variants
- `clsx` & `tailwind-merge` - Class utilities

### Development
- `vite` - Build tool
- `@vitejs/plugin-vue` - Vue plugin for Vite
- `typescript` - TypeScript compiler
- `vue-tsc` - Vue TypeScript checker
- `tailwindcss` - CSS framework
- `postcss` & `autoprefixer` - CSS processing

## Environment Configuration

The frontend uses environment variables for API configuration:

```bash
# API URL (development)
VITE_API_URL=http://localhost:3000
```

In production, API requests use relative URLs (proxied by the backend).

## Notes

- All images are lazy-loaded for better performance
- Keyboard navigation is supported in the reader (arrow keys)
- Reading progress is auto-saved
- Theme preference is saved to localStorage
- Responsive design works on mobile, tablet, and desktop
