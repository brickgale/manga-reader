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
      <div v-if="!currentChapter" class="mb-6">
        <h2 class="text-3xl font-bold mb-4">{{ manga.title }}</h2>
        
        <div v-if="progress" class="mb-6 p-4 bg-muted rounded-lg">
          <p class="text-sm mb-2">
            <strong>Last Read:</strong> Chapter {{ progress.lastChapterPath.split('/').pop() }}, Page {{ progress.lastPageNumber }}
          </p>
          <p class="text-sm">
            <strong>Farthest:</strong> Chapter {{ progress.farthestChapterPath.split('/').pop() }}, Page {{ progress.farthestPageNumber }}
          </p>
          <button
            @click="resumeReading"
            class="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Resume Reading
          </button>
        </div>

        <h3 class="text-xl font-semibold mb-4">Chapters</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            v-for="chapter in chapters"
            :key="chapter.path"
            @click="selectChapter(chapter)"
            variant="outline"
            class="h-auto p-4 justify-start"
          >
            {{ chapter.name }}
          </Button>
        </div>
      </div>

      <!-- Reader View -->
      <div v-else>
        <div class="mb-4 text-center">
          <h3 class="text-xl font-semibold">{{ currentChapter.name }}</h3>
          <p class="text-sm text-muted-foreground">
            Page {{ currentPage + 1 }} of {{ pages.length }}
          </p>
        </div>

        <Pagination
          :current-page="currentPage"
          :total-pages="pages.length"
          :chapters="chapters"
          :current-chapter-path="currentChapter?.path"
          @prev="previousPage"
          @next="nextPage"
          @change-page="goToPage"
          @change-chapter="changeChapter"
          class="mb-4"
        />

        <div v-if="pages.length > 0" class="flex justify-center mb-4">
          <img
            :src="api.getImageUrl(pages[currentPage].path)"
            :alt="`Page ${currentPage + 1}`"
            class="max-w-full h-auto cursor-pointer"
            @click="scrollDownPage"
          />
        </div>

        <Pagination
          :current-page="currentPage"
          :total-pages="pages.length"
          :chapters="chapters"
          :current-chapter-path="currentChapter?.path"
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
import { api, type Manga, type Chapter, type Page, type ReadingProgress } from '../api'
import { Button } from '@/components/ui'
import { Pagination } from '@/components/pagination'

const route = useRoute()
const router = useRouter()
const manga = ref<Manga | null>(null)
const chapters = ref<Chapter[]>([])
const currentChapter = ref<Chapter | null>(null)
const pages = ref<Page[]>([])
const currentPage = ref(0)
const progress = ref<ReadingProgress | null>(null)
const loading = ref(false)

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
        const chapter = chapters.value.find(c => c.path === chapterPath)
        if (chapter) {
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
  
  const chapter = chapters.value.find(c => c.path === progress.value!.lastChapterPath)
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

const nextPage = () => {
  if (currentPage.value < pages.value.length - 1) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
}

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  }
}
const goToPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'instant' })
}

const changeChapter = async (chapterPath: string) => {
  const chapter = chapters.value.find(c => c.path === chapterPath)
  if (chapter) {
    await selectChapter(chapter)
    window.scrollTo({ top: 0, behavior: 'instant' })
    updateURL()
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
