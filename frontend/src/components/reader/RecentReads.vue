<template>
  <div v-if="!loading && recentlyRead.length > 0" class="mb-8">
    <h2 class="text-2xl font-bold mb-4">Continue Reading</h2>
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <router-link
        v-for="item in recentlyRead"
        :key="item.id"
        :to="{
          path: `/manga/${item.mangaId}`,
          query: { chapter: item.chapterPath, page: item.pageNumber.toString() }
        }"
      >
        <Card class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <div class="aspect-[3/4] bg-muted flex items-center justify-center">
            <p class="text-muted-foreground text-sm">No Cover</p>
          </div>
          <CardHeader class="p-3">
            <CardTitle class="text-sm truncate">{{ item.manga?.title || 'Unknown' }}</CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-0">
            <p class="text-xs text-muted-foreground truncate">
              {{ item.chapterPath.split('/').pop() }} - Page {{ item.pageNumber + 1 }}
            </p>
          </CardContent>
        </Card>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type ReadingHistory } from '@/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

const recentlyRead = ref<ReadingHistory[]>([])
const loading = ref(true)

const loadRecentlyRead = async () => {
  loading.value = true
  try {
    const history = await api.getHistory()
    // Get unique manga (latest read first) - limit to 5
    const uniqueManga = new Map<string, ReadingHistory>()
    for (const item of history) {
      if (!uniqueManga.has(item.mangaId) && uniqueManga.size < 5) {
        uniqueManga.set(item.mangaId, item)
      }
    }
    recentlyRead.value = Array.from(uniqueManga.values())
  } catch (error) {
    console.error('Failed to load recently read:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecentlyRead()
})
</script>
