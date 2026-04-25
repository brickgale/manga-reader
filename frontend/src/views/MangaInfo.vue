<template>
  <div>
    <div
      v-if="loading"
      class="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-280px)]"
    >
      <LoadingIcon />
    </div>

    <div v-else-if="!manga" class="container mx-auto p-4 text-center py-8">
      <p>Manga not found</p>
    </div>

    <div v-else class="container mx-auto">
      <MangaInfoCard :manga="manga" :progress="progress" @resume="resumeReading" />
      <ChapterList :chapters="chapters" @select="selectChapter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Manga, type Chapter, type ReadingProgress } from '@/api'
import { MangaInfo as MangaInfoCard, ChapterList } from '@/components/reader'
import { LoadingIcon } from '@/components/loading-icon'
import { usePageLoading } from '@/composables/usePageLoading'

const route = useRoute()
const router = useRouter()
const { trackPromise } = usePageLoading()
const manga = ref<Manga | null>(null)
const chapters = ref<Chapter[]>([])
const progress = ref<ReadingProgress | null>(null)
const loading = ref(false)

// Helper to extract chapter name from path
const getChapterName = (chapterPath: string) => {
  return chapterPath.split('/').pop() || chapterPath
}

const loadMangaDetails = async () => {
  loading.value = true
  
  await trackPromise(
    (async () => {
      try {
        const mangaId = route.params.id as string
        const response = await api.getManga()
        manga.value = response.data.find(m => m.id === mangaId) || null

        if (manga.value) {
          chapters.value = await api.getChapters(manga.value.id)
          progress.value = await api.getProgress(manga.value.id)

          // Update page title
          document.title = `${manga.value.title} | Manga Reader`
        }
      } catch (error) {
        console.error('Failed to load manga:', error)
      } finally {
        loading.value = false
      }
    })()
  )
}

const selectChapter = (chapter: Chapter) => {
  if (!manga.value) return

  // Navigate to chapter reader route
  router.push({
    path: `/v/${manga.value.id}/chapter/${encodeURIComponent(chapter.path)}`,
    query: { page: '0' },
  })
}

const resumeReading = () => {
  if (!progress.value || !manga.value) return

  const normalizedProgressChapter = getChapterName(progress.value.lastChapterPath)
  const chapter = chapters.value.find(c => c.path === normalizedProgressChapter)
  if (chapter) {
    router.push({
      path: `/v/${manga.value.id}/chapter/${encodeURIComponent(chapter.path)}`,
      query: { page: progress.value.lastPageNumber.toString() },
    })
  }
}

onMounted(() => {
  loadMangaDetails()
})

watch(
  () => route.params.id,
  () => {
    manga.value = null
    chapters.value = []
    progress.value = null
    loadMangaDetails()
  }
)
</script>
