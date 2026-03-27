# Entity Relationship Diagram

This diagram represents the database schema for the Manga Reader application.

```mermaid
erDiagram
    Manga ||--o{ ReadingHistory : has
    Manga ||--o{ Bookmark : has
    Manga ||--o| ReadingProgress : has

    Manga {
        string id PK "UUID"
        string title
        string altTitle "nullable"
        string path UK "unique"
        string coverImage "nullable"
        datetime createdAt
        datetime updatedAt
    }

    ReadingHistory {
        string id PK "UUID"
        string mangaId FK
        string chapterPath
        int pageNumber
        datetime timestamp
    }

    Bookmark {
        string id PK "UUID"
        string mangaId FK
        string chapterPath
        int pageNumber
        string note "nullable"
        datetime createdAt
    }

    ReadingProgress {
        string id PK "UUID"
        string mangaId FK,UK "unique"
        string lastChapterPath
        int lastPageNumber
        string farthestChapterPath
        int farthestPageNumber
        datetime updatedAt
    }

    AppSettings {
        int id PK "always 1"
        string theme "default: dark"
        boolean enableChapterView "default: true"
        boolean enableSideReader "default: false"
        boolean showPageNumbers "default: true"
        string readingDirection "default: ltr"
        string pageFitMode "default: fit-width"
        int preloadNextPages "default: 3"
        boolean autoMarkAsRead "default: true"
        int defaultPageSize "default: 20"
        datetime updatedAt
    }
```

## Relationships

- **Manga → ReadingHistory**: One-to-Many (A manga can have multiple reading history entries)
- **Manga → Bookmark**: One-to-Many (A manga can have multiple bookmarks)
- **Manga → ReadingProgress**: One-to-One (A manga has one reading progress record)
- **AppSettings**: Singleton table (Only 1 row with id=1, pre-seeded on database initialization)

## Notes

- All foreign key relationships have `onDelete: Cascade` - deleting a manga will delete all associated records
- Indexes are created on:
  - `ReadingHistory`: mangaId, timestamp
  - `Bookmark`: mangaId
  - `ReadingProgress`: mangaId (unique)

## AppSettings Details

The AppSettings table stores application-wide preferences:

### UI Settings
- **theme**: Color theme (`dark`, `light`, `auto`)
- **enableChapterView**: Show/hide chapter view in reader
- **enableSideReader**: Open manga in drawer vs side panel
- **showPageNumbers**: Display page numbers while reading

### Reading Settings
- **readingDirection**: Reading flow direction (`ltr` for Western comics, `rtl` for manga)
- **pageFitMode**: How pages are displayed (`fit-width`, `fit-height`, `original`)
- **preloadNextPages**: Number of pages to preload ahead
- **autoMarkAsRead**: Automatically mark chapters as read when completed

### Pagination Settings
- **defaultPageSize**: Default number of items per page in lists
