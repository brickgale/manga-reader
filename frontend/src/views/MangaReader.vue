<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <p>Loading...</p>
    </div>

    <div v-else-if="!manga" class="text-center py-8">
      <p>Manga not found</p>
    </div>

    <div v-else>
      <!-- Manga Info & Chapter Selection -->
      <div v-if="!currentChapter">
        <MangaInfo 
          :manga="manga" 
          :progress="progress" 
          @resume="resumeReading" 
        />
        
        <ChapterList 
          :chapters="chapters" 
          @select="selectChapter" 
        />
      </div>

      <!-- Reader View -->
      <div v-else>
        <ReaderHeader
          :current-chapter="currentChapter"
          :current-page="currentPage"
          :total-pages="pages.length"
          :chapter-view-mode="readerStore.chapterViewMode"
          @toggle-view-mode="readerStore.toggleChapterViewMode"
        />

        <Pagination
          :current-page="currentPage"
          :total-pages="pages.length"
          :chapters="chapters"
          :current-chapter-path="currentChapter?.path"
          :hide-page-selector="readerStore.chapterViewMode"
          @prev="previousPage"
          @next="nextPage"
          @change-page="goToPage"
          @change-chapter="changeChapter"
          class="mb-4"
        />

        <PageViewer
          :pages="pages"
          :current-page="currentPage"
          :chapter-view-mode="readerStore.chapterViewMode"
          @page-click="scrollDownPage"
        />

        <Pagination
          :current-page="currentPage"
          :total-pages="pages.length"
          :chapters="chapters"
          :current-chapter-path="currentChapter?.path"
          :hide-page-selector="readerStore.chapterViewMode"
          @prev="previousPage"
          @next="nextPage"
          @change-page="goToPage"
          @change-chapter="changeChapter"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { api, type Manga, type Chapter, type Page, type ReadingProgress } from '@/api'
import { Pagination } from '@/components/pagination'
import { MangaInfo, ChapterList, ReaderHeader, PageViewer } from '@/components/reader'
import { useReaderStore } from '@/stores/reader'

const route = useRoute()
const router = useRouter()
const readerStore = useReaderStore()
const manga = ref<Manga | null>(null)
const chapters = ref<Chapter[]>([])
const currentChapter = ref<Chapter | null>(null)
const pages = ref<Page[]>([])
const currentChapterIndex = ref(0)
const currentPage = ref(0)
const progress = ref<ReadingProgress | null>(null)
const loading = ref(false)

// Helper to extract chapter name from path (handles both old full paths and new chapter names)
const getChapterName = (chapterPath: string) => {
  return chapterPath.split('/').pop() || chapterPath
}

const loadMangaDetails = async () => {
  loading.value = true
  try {
    const mangaId = route.params.id as string
    const response = await api.getManga()
    manga.value = response.data.find(m => m.id === mangaId) || null
    
    if (manga.value) {
      chapters.value = await api.getChapters(manga.value.id)
      progress.value = await api.getProgress(manga.value.id)
      
      // Auto-load chapter and page from query parameters
      const chapterPath = route.query.chapter as string
      const pageNum = route.query.page as string
      
      if (chapterPath && chapters.value.length > 0) {
        const normalizedQueryChapter = getChapterName(chapterPath)
        currentChapterIndex.value = chapters.value.findIndex(c => c.path === normalizedQueryChapter)
        if (currentChapterIndex.value !== -1) {
          const chapter = chapters.value[currentChapterIndex.value]
          await selectChapter(chapter)
          if (pageNum) {
            currentPage.value = parseInt(pageNum)
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to load manga:', error)
  } finally {
    loading.value = false
  }
}

const selectChapter = async (chapter: Chapter) => {
  if (!manga.value) return
  
  currentChapter.value = chapter
  currentPage.value = 0
  
  try {
    pages.value = await api.getPages(manga.value.id, chapter.path)
  } catch (error) {
    console.error('Failed to load pages:', error)
  }
}

const resumeReading = async () => {
  if (!progress.value || !manga.value) return
  
  const normalizedProgressChapter = getChapterName(progress.value.lastChapterPath)
  const chapter = chapters.value.find(c => c.path === normalizedProgressChapter)
  if (chapter) {
    await selectChapter(chapter)
    currentPage.value = progress.value.lastPageNumber
  }
}

const updateProgress = async () => {
  if (!manga.value || !currentChapter.value) return
  
  try {
    await api.updateProgress(manga.value.id, currentChapter.value.path, currentPage.value)
    await api.addHistory(manga.value.id, currentChapter.value.path, currentPage.value)
    progress.value = await api.getProgress(manga.value.id)
  } catch (error) {
    console.error('Failed to update progress:', error)
  }
}

const scrollDownPage = () => {
  const viewportHeight = window.innerHeight
  const scrollAmount = viewportHeight * 0.8 // Scroll 80% of viewport height
  const currentScrollPosition = window.scrollY + window.innerHeight
  const pageHeight = document.documentElement.scrollHeight
  
  // Check if we're already at the very bottom (within 10px tolerance)
  const isAtBottom = currentScrollPosition >= pageHeight - 10
  
  if (isAtBottom) {
    // If this is the last page of the chapter
    if (currentPage.value >= pages.value.length - 1) {
      // Find and go to next chapter
      const currentIndex = chapters.value.findIndex(c => c.path === currentChapter.value?.path)
      if (currentIndex >= 0 && currentIndex < chapters.value.length - 1) {
        const nextChapter = chapters.value[currentIndex + 1]
        changeChapter(nextChapter.path)
      }
    } else {
      // Go to next page in current chapter
      nextPage()
    }
  } else {
    // Just scroll down
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth'
    })
  }
}

const updateURL = () => {
  if (!manga.value || !currentChapter.value) return
  
  router.replace({
    path: `/manga/${manga.value.id}`,
    query: {
      chapter: currentChapter.value.path,
      page: currentPage.value.toString()
    }
  })
}

const changeChapter = async (chapterPath: string) => {
  const chapter = chapters.value.find(c => c.path === chapterPath)
  currentChapterIndex.value = chapters.value.findIndex(c => c.path === chapterPath)
  if (chapter) {
    await selectChapter(chapter)
    window.scrollTo({ top: 0, behavior: 'instant' })
    updateURL()
  }
}

const nextPage = () => {
  if(readerStore.chapterViewMode) {
    changeChapter(chapters.value[currentChapterIndex.value + 1].path)
    return;
  }

  if (currentPage.value < pages.value.length - 1) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
}

const previousPage = () => {
  if(readerStore.chapterViewMode) {
    changeChapter(chapters.value[currentChapterIndex.value - 1].path)
    return;
  }

  if (currentPage.value > 0) {
    currentPage.value--
    // Only change page if at the top, otherwise just scroll
    console.log('Previous page clicked, current scrollY:', window.scrollY)
    if (window.scrollY > 10) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    }
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'instant' })
}

const handleBookmark = async () => {
  if (!manga.value || !currentChapter.value) return
  
  const note = prompt('Add a note (optional):')
  try {
    await api.createBookmark(
      manga.value.id,
      currentChapter.value.path,
      currentPage.value,
      note || undefined
    )
    toast.success('Bookmark added!')
  } catch (error) {
    console.error('Failed to create bookmark:', error)
  }
}

watch(currentPage, () => {
  updateProgress()
  updatePageTitle()
  updateURL()
})

watch([manga, currentChapter], () => {
  updatePageTitle()
  if (currentChapter.value) {
    updateURL()
  }
})

const updatePageTitle = () => {
  if (manga.value && currentChapter.value && pages.value.length > 0) {
    document.title = `${manga.value.title} - ${currentChapter.value.name} - Page ${currentPage.value + 1} | Manga Reader`
  } else if (manga.value) {
    document.title = `${manga.value.title} | Manga Reader`
  } else {
    document.title = 'Manga Reader'
  }
}

onMounted(() => {
  loadMangaDetails()
  
  // Listen for header actions
  window.addEventListener('reader-action', handleReaderAction as EventListener)
})

const handleReaderAction = (event: CustomEvent) => {
  if (event.detail === 'chapters') {
    currentChapter.value = null
  } else if (event.detail === 'bookmark') {
    handleBookmark()
  }
}
</script>
