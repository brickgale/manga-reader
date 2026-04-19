<template>
  <div v-if="loading || recentlyRead.length > 0" class="mb-6">
    <div class="flex items-start justify-between mb-4">
      <h2 class="text-2xl flex items-center gap-2">
        <FastForward class="w-6 h-6" />
        Recently Read
      </h2>
      <Button v-if="!loading" variant="ghost" size="icon" @click="toggleExpanded">
        <ChevronDown v-if="isExpanded" class="h-5 w-5" />
        <ChevronRight v-else class="h-5 w-5" />
      </Button>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <MangaCardSkeleton v-for="n in 6" :key="n" />
    </div>
    
    <!-- Loaded State -->
    <div v-else-if="isExpanded" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <MangaCard
        v-for="(item, index) in recentlyRead"
        :key="item.id"
        :manga="item.manga!"
        :index="index"
        :chapter="item.chapterPath"
        :page="item.pageNumber"
        :subtitle="`${formatChapterName(item.chapterPath)} - Page ${item.pageNumber + 1}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronDown, ChevronRight, FastForward } from 'lucide-vue-next'
import { api, type ReadingHistory } from '@/api'
import { Button } from '@/components/ui'
import { MangaCard, MangaCardSkeleton } from '@/components/manga-card'

const formatChapterName = (path: string) => {
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

const recentlyRead = ref<ReadingHistory[]>([])
const loading = ref(true)
const isExpanded = ref(true)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  localStorage.setItem('continueReadingExpanded', String(isExpanded.value))
}

const loadRecentlyRead = async () => {
  loading.value = true
  const startTime = Date.now()
  
  try {
    const response = await api.getHistory(1, 6)
    recentlyRead.value = response.data
  } catch (error) {
    console.error('Failed to load recently read:', error)
  } finally {
    // Ensure minimum 1 second loading time for skeleton visibility
    const elapsed = Date.now() - startTime
    const remainingTime = Math.max(0, 1000 - elapsed)
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }
    
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
