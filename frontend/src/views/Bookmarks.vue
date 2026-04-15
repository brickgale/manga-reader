<template>
  <div>
    <h2 class="text-2xl mb-6 flex items-center gap-2">
      <BookmarkIcon class="w-6 h-6" />
      Bookmarks
    </h2>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <HistoryCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <div v-else-if="bookmarks.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No bookmarks yet.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        class="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
      >
        <!-- Delete Button -->
        <button
          @click="handleDelete(bookmark.id)"
          class="absolute top-2 right-2 z-20 text-destructive hover:text-destructive/90 p-1.5 rounded-sm hover:bg-destructive/10 bg-background/80 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
          title="Delete bookmark"
        >
          <Trash2 class="w-4 h-4" />
        </button>

        <!-- Note Overlay -->
        <div
          v-if="expandedNoteId === bookmark.id"
          @click="expandedNoteId = null"
          class="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm p-4 flex items-center justify-center cursor-pointer"
        >
          <div class="max-w-full overflow-y-auto max-h-full" @click.stop>
            <div class="flex items-start gap-2 text-sm">
              <MessageSquare class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p class="italic text-foreground">{{ bookmark.note }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-0 min-h-[160px]">
          <!-- Cover Image -->
          <router-link
            :to="{
              path: `/manga/${bookmark.mangaId}`,
              query: { chapter: bookmark.chapterPath, page: bookmark.pageNumber.toString() },
            }"
            class="relative flex-shrink-0 w-24 sm:w-28 self-stretch overflow-hidden"
          >
            <!-- Blurred background -->
            <img
              v-if="getCoverUrl(bookmark.manga)"
              :src="getCoverUrl(bookmark.manga)"
              alt=""
              class="absolute inset-0 w-full h-full object-cover blur-2xl scale-150 opacity-60"
            />
            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 z-10" />
            <!-- Main cover image -->
            <img
              v-if="getCoverUrl(bookmark.manga)"
              :src="getCoverUrl(bookmark.manga)"
              :alt="bookmark.manga?.title"
              class="absolute inset-0 w-full h-full object-contain z-20 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105"
            />
            <div v-else class="absolute inset-0 bg-muted flex items-center justify-center z-20">
              <BookOpen class="w-8 h-8 text-muted-foreground" />
            </div>
          </router-link>

          <!-- Info -->
          <div class="flex-1 min-w-0 p-4 flex flex-col justify-between">
            <router-link
              :to="{
                path: `/manga/${bookmark.mangaId}`,
                query: { chapter: bookmark.chapterPath, page: bookmark.pageNumber.toString() },
              }"
              class="flex flex-col space-y-2 flex-1"
            >
              <div>
                <h3
                  class="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors"
                >
                  {{ bookmark.manga?.title || 'Unknown' }}
                </h3>
                <p
                  v-if="bookmark.manga?.altTitle"
                  class="text-xs text-muted-foreground truncate mt-0.5"
                >
                  {{ bookmark.manga.altTitle }}
                </p>
              </div>

              <div class="space-y-1">
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen class="w-3.5 h-3.5" />
                  <span class="font-medium">{{ formatChapterName(bookmark.chapterPath) }}</span>
                </div>
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText class="w-3.5 h-3.5" />
                  <span>Page {{ bookmark.pageNumber + 1 }}</span>
                </div>
              </div>
            </router-link>

            <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t">
              <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock class="w-3.5 h-3.5" />
                <span>{{ formatRelativeTime(bookmark.createdAt) }}</span>
              </div>
              <button
                v-if="bookmark.note"
                @click.stop="expandedNoteId = bookmark.id"
                class="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                title="View note"
              >
                <MessageSquare class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trash2, BookOpen, FileText, Clock, MessageSquare, Bookmark as BookmarkIcon } from 'lucide-vue-next'
import { api, type Bookmark } from '@/api'
import { useMangaUtils } from '@/composables/useMangaUtils'
import { Card } from '@/components/ui'
import { HistoryCardSkeleton } from '@/components/ui/skeleton'

const bookmarks = ref<Bookmark[]>([])
const loading = ref(false)
const expandedNoteId = ref<string | null>(null)
const { getCoverUrl, formatChapterName } = useMangaUtils()

const formatRelativeTime = (timestamp: string) => {
  const now = new Date()
  const then = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return then.toLocaleDateString()
}

const loadBookmarks = async () => {
  loading.value = true
  try {
    const response = await api.getBookmarks()
    bookmarks.value = response.data
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this bookmark?')) return

  try {
    await api.deleteBookmark(id)
    await loadBookmarks()
  } catch (error) {
    console.error('Failed to delete bookmark:', error)
  }
}

onMounted(() => {
  loadBookmarks()
})
</script>
