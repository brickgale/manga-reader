<template>
  <div v-if="!loading && recentlyRead.length > 0" class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Continue Reading</h2>
      <Button variant="ghost" size="icon" @click="toggleExpanded">
        <ChevronDown v-if="isExpanded" class="h-5 w-5" />
        <ChevronRight v-else class="h-5 w-5" />
      </Button>
    </div>
    <div
      v-if="isExpanded"
      class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 [&>*:last-child]:hidden xl:[&>*:last-child]:block"
    >
      <router-link
        v-for="item in recentlyRead"
        :key="item.id"
        :to="{
          path: `/manga/${item.mangaId}`,
          query: { chapter: item.chapterPath, page: item.pageNumber.toString() },
        }"
      >
        <Card class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <div class="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
            <img
              v-if="item.manga?.coverImage"
              :src="item.manga.coverImage"
              :alt="item.manga.title"
              class="w-full h-full object-cover"
              @error="e => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <p v-else class="text-muted-foreground text-sm">No Cover</p>
          </div>
          <CardHeader class="p-3">
            <CardTitle class="text-sm truncate">{{ item.manga?.title || 'Unknown' }}</CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-0">
            <p class="text-xs text-muted-foreground truncate">
              {{ item.chapterPath }} - Page {{ item.pageNumber + 1 }}
            </p>
          </CardContent>
        </Card>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { api, type ReadingHistory } from '@/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'

const recentlyRead = ref<ReadingHistory[]>([])
const loading = ref(true)
const isExpanded = ref(true)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  localStorage.setItem('continueReadingExpanded', String(isExpanded.value))
}

const loadRecentlyRead = async () => {
  loading.value = true
  try {
    const response = await api.getHistory(1, 5)
    recentlyRead.value = response.data
  } catch (error) {
    console.error('Failed to load recently read:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Restore expanded state from localStorage
  const saved = localStorage.getItem('continueReadingExpanded')
  if (saved !== null) {
    isExpanded.value = saved === 'true'
  }
  loadRecentlyRead()
})
</script>
