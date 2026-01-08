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

export const api = {
  // Manga endpoints
  async getManga(): Promise<Manga[]> {
    const { data } = await axios.get(`${API_URL}/manga`)
    return data
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
  async getHistory(): Promise<ReadingHistory[]> {
    const { data } = await axios.get(`${API_URL}/history`)
    return data
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
  async getBookmarks(): Promise<Bookmark[]> {
    const { data } = await axios.get(`${API_URL}/bookmarks`)
    return data
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
