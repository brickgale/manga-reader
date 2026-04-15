<template>
  <div>
    <h2 class="text-2xl mb-6">Reading History</h2>

    <div v-if="loading" class="text-center py-8">
      <p>Loading history...</p>
    </div>

    <div v-else-if="history.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No reading history yet.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <router-link
        v-for="item in history"
        :key="item.id"
        :to="{
          path: `/manga/${item.mangaId}`,
          query: { chapter: item.chapterPath, page: item.pageNumber.toString() },
        }"
        class="group"
      >
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div class="flex gap-0 min-h-[160px]">
            <!-- Cover Image -->
            <div class="relative flex-shrink-0 w-24 sm:w-28 self-stretch overflow-hidden">
              <!-- Blurred background -->
              <img
                v-if="getCoverUrl(item.manga)"
                :src="getCoverUrl(item.manga)"
                alt=""
                class="absolute inset-0 w-full h-full object-cover blur-2xl scale-150 opacity-60"
              />
              <!-- Gradient overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 z-10"
              />
              <!-- Main cover image -->
              <img
                v-if="getCoverUrl(item.manga)"
                :src="getCoverUrl(item.manga)"
                :alt="item.manga?.title"
                class="absolute inset-0 w-full h-full object-contain z-20 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105"
              />
              <div v-else class="absolute inset-0 bg-muted flex items-center justify-center z-20">
                <BookOpen class="w-8 h-8 text-muted-foreground" />
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 p-4 flex flex-col justify-between">
              <div class="space-y-2">
                <div>
                  <h3
                    class="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors"
                    :title="item.manga?.title || 'Unknown'"
                  >
                    {{ item.manga?.title || 'Unknown' }}
                  </h3>
                  <p
                    v-if="item.manga?.altTitle"
                    class="text-xs text-muted-foreground truncate mt-0.5"
                  >
                    {{ item.manga.altTitle }}
                  </p>
                </div>

                <div class="space-y-1">
                  <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookmarkIcon class="w-3.5 h-3.5" />
                    <span class="font-medium">{{ formatChapterName(item.chapterPath) }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText class="w-3.5 h-3.5" />
                    <span>Page {{ item.pageNumber + 1 }}</span>
                  </div>
                </div>
              </div>

              <div
                class="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-3 border-t"
              >
                <Clock class="w-3.5 h-3.5" />
                <span>{{ formatRelativeTime(item.timestamp) }}</span>
              </div>
            </div>
          </div>
        </Card>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BookOpen, BookmarkIcon, FileText, Clock } from 'lucide-vue-next'
import { api, type ReadingHistory } from '@/api'
import { useMangaUtils } from '@/composables/useMangaUtils'
import { Card } from '@/components/ui'

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
  try {
    const response = await api.getHistory()
    history.value = response.data
  } catch (error) {
    console.error('Failed to load history:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHistory()
})
</script>
