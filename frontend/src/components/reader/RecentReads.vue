<template>
  <div v-if="loading || recentlyRead.length > 0" class="mb-6">
    <div class="flex items-start justify-between mb-4">
      <h2 class="text-lg sm:text-2xl flex items-center gap-2">
        <FastForward class="w-5 h-5 sm:w-6 sm:h-6" />
        Recently Read
      </h2>
      <div class="flex items-center gap-0.5 sm:gap-2">
        <!-- Navigation Buttons -->
        <Button
          v-if="!loading && isExpanded"
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0 sm:h-10 sm:w-10"
          :disabled="currentPage === 0"
          aria-label="Previous page"
          @click="goToPrevPage"
        >
          <ChevronLeft class="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <Button
          v-if="!loading && isExpanded"
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0 sm:h-10 sm:w-10"
          :disabled="currentPage >= totalPages - 1"
          aria-label="Next page"
          @click="goToNextPage"
        >
          <ChevronRight class="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <!-- Collapse Button -->
        <Button
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0 sm:h-10 sm:w-10"
          :aria-label="isExpanded ? 'Collapse recently read' : 'Expand recently read'"
          @click="toggleExpanded"
        >
          <ChevronDown v-if="isExpanded" class="h-4 w-4 sm:h-5 sm:w-5" />
          <ChevronRight v-else class="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>

    <!-- Loading State (only when expanded) -->
    <div
      v-if="loading && isExpanded"
      class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      <MangaCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <!-- Paginated Container -->
    <div v-else-if="!loading && isExpanded">
      <!-- Grid -->
      <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <MangaCard
          v-for="(item, index) in visibleItems"
          :key="item.id"
          :manga="item.manga!"
          :index="startIndex + index"
          :chapter="item.chapterPath"
          :page="item.pageNumber"
          :subtitle="`${formatChapterName(item.chapterPath)} - Page ${item.pageNumber + 1}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ChevronDown, ChevronRight, ChevronLeft, FastForward } from 'lucide-vue-next'
import { api, type ReadingHistory } from '@/api'
import { Button } from '@/components/ui'
import { MangaCard, MangaCardSkeleton } from '@/components/manga-card'
import { withMinimumLoadingTime } from '@/composables/useLoadingHelper'

const formatChapterName = (path: string) => {
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

const recentlyRead = ref<ReadingHistory[]>([])
const loading = ref(true)
const isExpanded = ref(true)
const currentPage = ref(0)
const windowWidth = ref(window.innerWidth)

// Calculate items per page based on screen width
const itemsPerPage = computed(() => {
  if (windowWidth.value >= 1280) return 6 // xl
  if (windowWidth.value >= 1024) return 5 // lg
  if (windowWidth.value >= 768) return 4 // md
  return 3 // sm and below
})

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(recentlyRead.value.length / itemsPerPage.value)
})

// Calculate start index for current page
const startIndex = computed(() => {
  return currentPage.value * itemsPerPage.value
})

// Get visible items for current page
const visibleItems = computed(() => {
  const start = startIndex.value
  const end = start + itemsPerPage.value
  return recentlyRead.value.slice(start, end)
})

const goToPrevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  localStorage.setItem('continueReadingExpanded', String(isExpanded.value))
  currentPage.value = 0 // Reset to first page when toggling
}

const loadRecentlyRead = async () => {
  loading.value = true

  try {
    const response = await withMinimumLoadingTime(() => api.getHistory(1, 12))
    recentlyRead.value = response.data
  } catch (error) {
    console.error('Failed to load recently read:', error)
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  // Reset to valid page if current page exceeds new total
  if (currentPage.value >= totalPages.value) {
    currentPage.value = Math.max(0, totalPages.value - 1)
  }
}

onMounted(() => {
  // Restore expanded state from localStorage
  const saved = localStorage.getItem('continueReadingExpanded')
  if (saved !== null) {
    isExpanded.value = saved === 'true'
  }
  loadRecentlyRead()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
