# API Endpoints

This document contains API endpoints that are available in the backend but not yet integrated into the frontend UI.

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
