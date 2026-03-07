import { api, type Manga } from '@/api'

export function useMangaUtils() {
  const getCoverUrl = (manga: Manga | undefined): string | null => {
    if (!manga?.coverImage) return null
    if (manga.coverImage.startsWith('http') || manga.coverImage.startsWith('/api')) {
      return manga.coverImage
    }
    return api.getImageUrl(manga.coverImage)
  }

  const formatChapterName = (chapterPath: string): string => {
    return chapterPath.split('/').pop() || chapterPath
  }

  return { getCoverUrl, formatChapterName }
}
