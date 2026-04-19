<template>
  <div>
    <h2 class="text-2xl mb-6 flex items-center gap-2">
      <Scroll class="w-6 h-6" />
      Reading History
    </h2>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <HistoryCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <div v-else-if="history.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No reading history yet.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="(item, index) in history"
        :key="item.id"
        class="group animate-fade-in-up"
        :class="`stagger-${(index % 6) + 1}`"
      >
        <ReadingCard
          :manga-id="item.mangaId"
          :chapter-path="item.chapterPath"
          :page-number="item.pageNumber"
          :title="item.manga?.title || 'Unknown'"
          :alt-title="item.manga?.altTitle || undefined"
          :cover-url="getCoverUrl(item.manga)"
          :chapter-name="formatChapterName(item.chapterPath)"
          :formatted-time="formatRelativeTime(item.timestamp)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Scroll } from 'lucide-vue-next'
import { api, type ReadingHistory } from '@/api'
import { useMangaUtils } from '@/composables/useMangaUtils'
import { ReadingCard } from '@/components/reader'
import { HistoryCardSkeleton } from '@/components/ui/skeleton'

const history = ref<ReadingHistory[]>([])
const loading = ref(false)
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

const loadHistory = async () => {
  loading.value = true
  const startTime = Date.now()
  
  try {
    const response = await api.getHistory()
    history.value = response.data
  } catch (error) {
    console.error('Failed to load history:', error)
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
  loadHistory()
})
</script>
