<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Bookmarks</h2>

    <div v-if="loading" class="text-center py-8">
      <p>Loading bookmarks...</p>
    </div>

    <div v-else-if="bookmarks.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No bookmarks yet.</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex gap-4">
          <!-- Cover Image -->
          <router-link
            :to="{
              path: `/manga/${bookmark.mangaId}`,
              query: { chapter: bookmark.chapterPath, page: bookmark.pageNumber.toString() },
            }"
            class="flex-shrink-0"
          >
            <img
              v-if="getCoverUrl(bookmark.manga)"
              :src="getCoverUrl(bookmark.manga)"
              :alt="bookmark.manga?.title"
              class="w-16 h-24 object-cover rounded-md"
            />
            <div v-else class="w-16 h-24 bg-muted rounded-md flex items-center justify-center">
              <span class="text-muted-foreground text-xs">No Cover</span>
            </div>
          </router-link>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <router-link
              :to="{
                path: `/manga/${bookmark.mangaId}`,
                query: { chapter: bookmark.chapterPath, page: bookmark.pageNumber.toString() },
              }"
              class="block"
            >
              <h3 class="font-semibold text-lg truncate">{{ bookmark.manga?.title }}</h3>
              <p
                v-if="bookmark.manga?.altTitle"
                class="text-xs text-muted-foreground truncate mb-1"
              >
                {{ bookmark.manga.altTitle }}
              </p>
              <p class="text-sm text-muted-foreground">
                Chapter: {{ formatChapterName(bookmark.chapterPath) }} · Page
                {{ bookmark.pageNumber + 1 }}
              </p>
              <p v-if="bookmark.note" class="text-sm mt-1 italic text-muted-foreground">
                "{{ bookmark.note }}"
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ new Date(bookmark.createdAt).toLocaleString() }}
              </p>
            </router-link>
          </div>

          <!-- Delete Button -->
          <button
            @click="handleDelete(bookmark.id)"
            class="flex-shrink-0 text-destructive hover:text-destructive/90 self-start p-1 rounded hover:bg-destructive/10 transition-colors"
            title="Delete bookmark"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { api, type Bookmark } from '@/api'
import { useMangaUtils } from '@/composables/useMangaUtils'

const bookmarks = ref<Bookmark[]>([])
const loading = ref(false)
const { getCoverUrl, formatChapterName } = useMangaUtils()

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
