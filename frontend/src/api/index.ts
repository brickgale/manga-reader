import axios from 'axios'

const API_URL = '/api'

export interface Manga {
  id: string
  title: string
  path: string
  coverImage: string | null
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  name: string
  path: string
}

export interface Page {
  name: string
  path: string
}

export interface ReadingHistory {
  id: string
  mangaId: string
  chapterPath: string
  pageNumber: number
  timestamp: string
  manga?: Manga
}

export interface Bookmark {
  id: string
  mangaId: string
  chapterPath: string
  pageNumber: number
  note: string | null
  createdAt: string
  manga?: Manga
}

export interface ReadingProgress {
  id: string
  mangaId: string
  lastChapterPath: string
  lastPageNumber: number
  farthestChapterPath: string
  farthestPageNumber: number
  updatedAt: string
}

export interface Config {
  mangaStoragePath: string
}

export interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export const api = {
  // Config endpoints
  async getConfig(): Promise<Config> {
    const { data } = await axios.get(`${API_URL}/config`)
    return data
  },

  // Manga endpoints
  async getManga(page?: number, pageSize?: number): Promise<PaginatedResponse<Manga>> {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', String(page))
    if (pageSize !== undefined) params.append('pageSize', String(pageSize))

    const { data } = await axios.get(`${API_URL}/manga${params.toString() ? '?' + params : ''}`)

    // Convert cover image paths to full URLs
    return {
      ...data,
      data: data.data.map((manga: Manga) => ({
        ...manga,
        coverImage: manga.coverImage?.startsWith('/covers/')
          ? `${API_URL}/manga${manga.coverImage}`
          : manga.coverImage,
      })),
    }
  },

  async scanDirectory(dirPath: string): Promise<Manga[]> {
    const { data } = await axios.post(`${API_URL}/manga/scan`, { dirPath })
    return data
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const { data } = await axios.get(`${API_URL}/manga/${mangaId}/chapters`)
    return data
  },

  async getPages(mangaId: string, chapterPath: string): Promise<Page[]> {
    const { data } = await axios.get(
      `${API_URL}/manga/${mangaId}/chapters/${encodeURIComponent(chapterPath)}/pages`
    )
    return data
  },

  getImageUrl(imagePath: string): string {
    return `${API_URL}/manga/image?imagePath=${encodeURIComponent(imagePath)}`
  },

  // History endpoints
  async getHistory(page?: number, pageSize?: number): Promise<PaginatedResponse<ReadingHistory>> {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', String(page))
    if (pageSize !== undefined) params.append('pageSize', String(pageSize))

    const { data } = await axios.get(`${API_URL}/history${params.toString() ? '?' + params : ''}`)

    // Convert cover image paths to full URLs in nested manga objects
    return {
      ...data,
      data: data.data.map((item: ReadingHistory) => ({
        ...item,
        manga: item.manga
          ? {
              ...item.manga,
              coverImage: item.manga.coverImage?.startsWith('/covers/')
                ? `${API_URL}/manga${item.manga.coverImage}`
                : item.manga.coverImage,
            }
          : undefined,
      })),
    }
  },

  async getMangaHistory(mangaId: string): Promise<ReadingHistory[]> {
    const { data } = await axios.get(`${API_URL}/history/manga/${mangaId}`)
    return data
  },

  async addHistory(
    mangaId: string,
    chapterPath: string,
    pageNumber: number
  ): Promise<ReadingHistory> {
    const { data } = await axios.post(`${API_URL}/history`, {
      mangaId,
      chapterPath,
      pageNumber,
    })
    return data
  },

  // Bookmark endpoints
  async getBookmarks(page?: number, pageSize?: number): Promise<PaginatedResponse<Bookmark>> {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', String(page))
    if (pageSize !== undefined) params.append('pageSize', String(pageSize))

    const { data } = await axios.get(`${API_URL}/bookmarks${params.toString() ? '?' + params : ''}`)

    // Convert cover image paths to full URLs in nested manga objects
    return {
      ...data,
      data: data.data.map((item: Bookmark) => ({
        ...item,
        manga: item.manga
          ? {
              ...item.manga,
              coverImage: item.manga.coverImage?.startsWith('/covers/')
                ? `${API_URL}/manga${item.manga.coverImage}`
                : item.manga.coverImage,
            }
          : undefined,
      })),
    }
  },

  async getMangaBookmarks(mangaId: string): Promise<Bookmark[]> {
    const { data } = await axios.get(`${API_URL}/bookmarks/manga/${mangaId}`)
    return data
  },

  async createBookmark(
    mangaId: string,
    chapterPath: string,
    pageNumber: number,
    note?: string
  ): Promise<Bookmark> {
    const { data } = await axios.post(`${API_URL}/bookmarks`, {
      mangaId,
      chapterPath,
      pageNumber,
      note,
    })
    return data
  },

  async deleteBookmark(id: string): Promise<void> {
    await axios.delete(`${API_URL}/bookmarks/${id}`)
  },

  // Progress endpoints
  async getProgress(mangaId: string): Promise<ReadingProgress | null> {
    const { data } = await axios.get(`${API_URL}/progress/manga/${mangaId}`)
    return data
  },

  async updateProgress(
    mangaId: string,
    chapterPath: string,
    pageNumber: number
  ): Promise<ReadingProgress> {
    const { data } = await axios.post(`${API_URL}/progress`, {
      mangaId,
      chapterPath,
      pageNumber,
    })
    return data
  },
}
