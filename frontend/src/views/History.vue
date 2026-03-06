<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Reading History</h2>

    <div v-if="loading" class="text-center py-8">
      <p>Loading history...</p>
    </div>

    <div v-else-if="history.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No reading history yet.</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="item in history"
        :key="item.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <router-link
          :to="{
            path: `/manga/${item.mangaId}`,
            query: { chapter: item.chapterPath, page: item.pageNumber.toString() },
          }"
          class="flex gap-4"
        >
          <!-- Cover Image -->
          <div class="flex-shrink-0">
            <img
              v-if="getCoverUrl(item.manga)"
              :src="getCoverUrl(item.manga)"
              :alt="item.manga?.title"
              class="w-16 h-24 object-cover rounded-md"
            />
            <div v-else class="w-16 h-24 bg-muted rounded-md flex items-center justify-center">
              <span class="text-muted-foreground text-xs">No Cover</span>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-lg truncate">{{ item.manga?.title }}</h3>
            <p v-if="item.manga?.altTitle" class="text-xs text-muted-foreground truncate mb-1">
              {{ item.manga.altTitle }}
            </p>
            <p class="text-sm text-muted-foreground">
              Chapter: {{ formatChapterName(item.chapterPath) }} · Page {{ item.pageNumber + 1 }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ new Date(item.timestamp).toLocaleString() }}
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type ReadingHistory, type Manga } from '@/api'

const history = ref<ReadingHistory[]>([])
const loading = ref(false)

const loadHistory = async () => {
  loading.value = true
  try {
    const response = await api.getHistory()
    history.value = response.data
  } catch (error) {
    console.error('Failed to load history:', error)
  } finally {
    loading.value = false
  }
}

const getCoverUrl = (manga: Manga | undefined) => {
  if (!manga?.coverImage) return null
  if (manga.coverImage.startsWith('http') || manga.coverImage.startsWith('/api')) {
    return manga.coverImage
  }
  return api.getImageUrl(manga.coverImage)
}

const formatChapterName = (chapterPath: string) => {
  return chapterPath.split('/').pop() || chapterPath
}

onMounted(() => {
  loadHistory()
})
</script>
