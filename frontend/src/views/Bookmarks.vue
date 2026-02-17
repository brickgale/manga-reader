<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Bookmarks</h2>

    <div v-if="loading" class="text-center py-8">
      <p>Loading bookmarks...</p>
    </div>

    <div v-else-if="bookmarks.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No bookmarks yet.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <router-link
            :to="{
              path: `/manga/${bookmark.mangaId}`,
              query: { chapter: bookmark.chapterPath, page: bookmark.pageNumber.toString() }
            }"
            class="flex-1"
          >
            <h3 class="font-semibold text-lg mb-2">{{ bookmark.manga?.title }}</h3>
            <p class="text-sm text-muted-foreground mb-1">
              Chapter: {{ bookmark.chapterPath.split('/').pop() }}
            </p>
            <p class="text-sm text-muted-foreground mb-1">
              Page: {{ bookmark.pageNumber }}
            </p>
            <p v-if="bookmark.note" class="text-sm mt-2 italic">
              "{{ bookmark.note }}"
            </p>
            <p class="text-xs text-muted-foreground mt-2">
              {{ new Date(bookmark.createdAt).toLocaleString() }}
            </p>
          </router-link>
          <button
            @click="handleDelete(bookmark.id)"
            class="text-destructive hover:text-destructive/90 ml-4"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type Bookmark } from '@/api'

const bookmarks = ref<Bookmark[]>([])
const loading = ref(false)

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
