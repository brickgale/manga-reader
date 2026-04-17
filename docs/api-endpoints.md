# API Endpoints

This document contains API endpoints that are available in the backend.

## Settings API

Manage application-wide settings for the manga reader.

### Get Settings

Get the current application settings.

**Endpoint:** `GET /api/settings`

**Response:**

```json
{
  "id": 1,
  "theme": "dark",
  "enableChapterView": true,
  "enableSideReader": false,
  "showPageNumbers": true,
  "readingDirection": "ltr",
  "pageFitMode": "fit-width",
  "preloadNextPages": 3,
  "autoMarkAsRead": true,
  "defaultPageSize": 20,
  "updatedAt": "2026-03-28T10:00:00.000Z"
}
```

### Update Settings (Full)

Update settings with provided values. Only the fields included in the request body will be changed (same as PATCH).

**Endpoint:** `PUT /api/settings`

**Request Body:**

```json
{
  "theme": "light",
  "enableChapterView": false,
  "enableSideReader": true,
  "showPageNumbers": false,
  "readingDirection": "rtl",
  "pageFitMode": "fit-height",
  "preloadNextPages": 5,
  "autoMarkAsRead": false,
  "defaultPageSize": 30
}
```

### Update Settings (Partial)

Update only specific settings fields.

**Endpoint:** `PATCH /api/settings`

**Request Body:**

```json
{
  "theme": "auto",
  "enableSideReader": true
}
```

### Reset Settings

Reset all settings to their default values.

**Endpoint:** `POST /api/settings/reset`

**Response:**

```json
{
  "id": 1,
  "theme": "dark",
  "enableChapterView": true,
  "enableSideReader": false,
  "showPageNumbers": true,
  "readingDirection": "ltr",
  "pageFitMode": "fit-width",
  "preloadNextPages": 3,
  "autoMarkAsRead": true,
  "defaultPageSize": 20,
  "updatedAt": "2026-03-28T10:00:00.000Z"
}
```

**Settings Fields:**

- `theme`: Color theme - `"dark"`, `"light"`, or `"auto"` (default: `"dark"`)
- `enableChapterView`: Show chapter view in reader (default: `true`)
- `enableSideReader`: Open manga in drawer vs side panel (default: `false`)
- `showPageNumbers`: Display page numbers while reading (default: `true`)
- `readingDirection`: Reading flow - `"ltr"` (left-to-right) or `"rtl"` (right-to-left for manga) (default: `"ltr"`)
- `pageFitMode`: How pages are displayed - `"fit-width"`, `"fit-height"`, or `"original"` (default: `"fit-width"`)
- `preloadNextPages`: Number of pages to preload ahead (default: `3`)
- `autoMarkAsRead`: Auto-mark chapters as read when completed (default: `true`)
- `defaultPageSize`: Default items per page in lists (default: `20`)

## Manga APIs

### Update Manga Metadata

Manually update a manga's metadata using a MangaDex ID.

**Endpoint:** `POST /api/manga/update-metadata/:id`

**Parameters:**

- `:id` (path) - The database ID of the manga to update

**Request Body:**

```json
{
  "mangadexId": "274a8e39-71a8-4bd2-af19-4572518fe44f"
}
```

**Response:**

```json
{
  "message": "Successfully updated manga metadata",
  "manga": {
    "id": "f3df3ead-67e1-4cbb-a1db-b9a363d0bddf",
    "title": "Updated Manga Title",
    "coverImage": "/path/to/cover.jpg",
    "path": "/manga/Updated Manga Title",
    "createdAt": "2026-01-08T08:24:10.000Z",
    "updatedAt": "2026-02-18T12:00:00.000Z"
  }
}
```

**Error Response:**

```json
{
  "error": "Failed to update manga metadata"
}
```

**Example Usage:**

Using curl:

```bash
curl -X POST http://localhost:3001/api/manga/update-metadata/f3df3ead-67e1-4cbb-a1db-b9a363d0bddf \
  -H "Content-Type: application/json" \
  -d '{"mangadexId": "274a8e39-71a8-4bd2-af19-4572518fe44f"}'
```

Using JavaScript/fetch:

```javascript
const response = await fetch('http://localhost:3001/api/manga/update-metadata/MANGA_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mangadexId: '274a8e39-71a8-4bd2-af19-4572518fe44f',
  }),
})

const data = await response.json()
console.log(data)
```

**Notes:**

- The MangaDex ID can be found in the MangaDex URL: `https://mangadex.org/title/{mangadexId}/manga-name`
- The endpoint prioritizes local cover images over downloaded ones
- If a local cover exists (cover.jpg, cover.jpeg, cover.png, cover.webp) in the manga folder, it will be used
- External cover URLs are not saved to prevent database pollution

**Status:** Not integrated in frontend UI

## Search API

### Search Manga

Search for manga by title or alternative title.

**Endpoint:** `GET /api/manga/search`

**Parameters:**

- `q` (query, required) - Search query string
- `page` (query, optional) - Page number (default: 1)
- `pageSize` (query, optional) - Items per page (default: 20)

**Response:**

```json
{
  "data": [
    {
      "id": "f3df3ead-67e1-4cbb-a1db-b9a363d0bddf",
      "title": "One Piece",
      "altTitle": "ワンピース",
      "path": "/manga/One Piece",
      "coverImage": "/covers/abc123.jpg",
      "chapterCount": 1095,
      "createdAt": "2026-01-08T08:24:10.000Z",
      "updatedAt": "2026-02-18T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 1,
    "totalItems": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Error Responses:**

```json
{
  "error": "Search query is required"
}
```

```json
{
  "error": "Search query cannot be empty"
}
```

**Example Usage:**

```bash
curl "http://localhost:3001/api/manga/search?q=one+piece&page=1&pageSize=12"
```

**Notes:**

- Search is case-insensitive by default (SQLite LIKE behavior)
- Searches both `title` and `altTitle` fields
- Returns paginated results with chapter counts

**Status:** ✅ Integrated in frontend at `/search` route

## System API

### Get Version

Get the current application version.

**Endpoint:** `GET /api/version`

**Response:**

```json
{
  "version": "x.y.z"
}
```

**Example Usage:**

```bash
curl http://localhost:3001/api/version
```
