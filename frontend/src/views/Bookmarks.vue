<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trash2, MessageSquare, Bookmark as BookmarkIcon } from 'lucide-vue-next'
import { api, type Bookmark } from '@/api'
import { useMangaUtils } from '@/composables/useMangaUtils'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { ReadingCard } from '@/components/reader'
import { HistoryCardSkeleton } from '@/components/ui/skeleton'

const bookmarks = ref<Bookmark[]>([])
const loading = ref(false)
const expandedNoteId = ref<string | null>(null)
const deleteDialogOpen = ref(false)
const bookmarkToDelete = ref<string | null>(null)
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

const openDeleteDialog = (id: string) => {
  bookmarkToDelete.value = id
  deleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!bookmarkToDelete.value) return

  try {
    await api.deleteBookmark(bookmarkToDelete.value)
    await loadBookmarks()
  } catch (error) {
    console.error('Failed to delete bookmark:', error)
  } finally {
    deleteDialogOpen.value = false
    bookmarkToDelete.value = null
  }
}

onMounted(() => {
  loadBookmarks()
})
</script>

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
      <div
        v-for="(bookmark, index) in bookmarks"
        :key="bookmark.id"
        class="group relative animate-fade-in-up"
        :class="`stagger-${(index % 6) + 1}`"
      >
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

        <ReadingCard
          :manga-id="bookmark.mangaId"
          :chapter-path="bookmark.chapterPath"
          :page-number="bookmark.pageNumber"
          :title="bookmark.manga?.title || 'Unknown'"
          :alt-title="bookmark.manga?.altTitle || undefined"
          :cover-url="getCoverUrl(bookmark.manga)"
          :chapter-name="formatChapterName(bookmark.chapterPath)"
          :formatted-time="formatRelativeTime(bookmark.createdAt)"
        >
          <template #actions>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                v-if="bookmark.note"
                @click.stop="expandedNoteId = bookmark.id"
                class="text-xs text-primary hover:text-primary/80 hover:bg-primary/10 p-1 rounded transition-colors"
                title="View note"
              >
                <MessageSquare class="w-3.5 h-3.5" />
              </button>
              <button
                @click="openDeleteDialog(bookmark.id)"
                class="text-xs text-destructive dark:text-red-400 hover:text-destructive/90 dark:hover:text-red-300 hover:bg-destructive/10 dark:hover:bg-red-400/10 p-1 rounded transition-colors"
                title="Delete bookmark"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </template>
        </ReadingCard>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bookmark</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this bookmark? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteDialogOpen = false">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
