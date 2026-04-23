<template>
  <div>
    <div
      v-if="loading"
      class="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-280px)]"
    >
      <LoadingIcon />
    </div>

    <div v-else-if="!manga || !currentChapter" class="container mx-auto p-4 text-center py-8">
      <p>Chapter not found</p>
    </div>

    <div v-else>
      <ReaderHeader
        :manga-title="manga.title"
        :manga-id="manga.id"
        :current-page="currentPage"
        :total-pages="pages.length"
        :webtoon-mode="readerStore.webtoonMode"
        @toggle-sidebar="emit('toggle-sidebar')"
        @toggle-view-mode="readerStore.toggleWebtoonMode"
      >
        <template #pagination>
          <Pagination
            :current-page="currentPage"
            :total-pages="pages.length"
            :chapters="chapters"
            :current-chapter-path="currentChapter?.path"
            :hide-page-selector="readerStore.webtoonMode"
            :disable-prev="readerStore.webtoonMode && currentChapterIndex === 0"
            :disable-next="readerStore.webtoonMode && currentChapterIndex === chapters.length - 1"
            @prev="previousPage"
            @next="nextPage"
            @change-page="goToPage"
            @change-chapter="changeChapter"
          />
        </template>
      </ReaderHeader>

      <PageViewer
        :pages="pages"
        :current-page="currentPage"
        :webtoon-mode="readerStore.webtoonMode"
        @page-click="scrollDownPage"
      />
    </div>

    <!-- Bookmark Dialog -->
    <Dialog v-model:open="bookmarkDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
          <DialogDescription>
            Add a bookmark for {{ manga?.title }} - Chapter
            {{ currentChapter ? getChapterName(currentChapter.path) : '' }}, Page
            {{ currentPage + 1 }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <label for="note" class="text-sm font-medium">Note (optional)</label>
            <textarea
              id="note"
              v-model="bookmarkNote"
              rows="3"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Add a note about this page..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="bookmarkDialogOpen = false">Cancel</Button>
          <Button @click="saveBookmark">Save Bookmark</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { api, type Manga, type Chapter, type Page } from '@/api'
import { Pagination } from '@/components/pagination'
import { PageViewer } from '@/components/reader'
import { ReaderHeader } from '@/components/header'
import { LoadingIcon } from '@/components/loading-icon'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useReaderStore } from '@/stores/reader'

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const router = useRouter()
const readerStore = useReaderStore()
const manga = ref<Manga | null>(null)
const chapters = ref<Chapter[]>([])
const currentChapter = ref<Chapter | null>(null)
const pages = ref<Page[]>([])
const currentChapterIndex = ref(0)
const currentPage = ref(0)
const loading = ref(false)
const bookmarkDialogOpen = ref(false)
const bookmarkNote = ref('')

// Helper to extract chapter name from path
const getChapterName = (chapterPath: string) => {
  return chapterPath.split('/').pop() || chapterPath
}

const loadChapterData = async () => {
  loading.value = true
  try {
    const mangaId = route.params.id as string
    const chapterId = decodeURIComponent(route.params.chapterId as string)
    const pageNum = route.query.page as string

    // Load manga and chapters
    const response = await api.getManga()
    manga.value = response.data.find(m => m.id === mangaId) || null

    if (manga.value) {
      chapters.value = await api.getChapters(manga.value.id)

      // Find the chapter
      currentChapterIndex.value = chapters.value.findIndex(c => c.path === chapterId)
      if (currentChapterIndex.value !== -1) {
        currentChapter.value = chapters.value[currentChapterIndex.value]

        // Load pages
        pages.value = await api.getPages(manga.value.id, currentChapter.value.path)

        // Set page number
        if (pageNum) {
          currentPage.value = parseInt(pageNum)
        }

        updatePageTitle()
      }
    }
  } catch (error) {
    console.error('Failed to load chapter:', error)
  } finally {
    loading.value = false
  }
}

const updateProgress = async () => {
  if (!manga.value || !currentChapter.value) return

  try {
    await api.updateProgress(manga.value.id, currentChapter.value.path, currentPage.value)
    await api.addHistory(manga.value.id, currentChapter.value.path, currentPage.value)
  } catch (error) {
    console.error('Failed to update progress:', error)
  }
}

const scrollDownPage = () => {
  const viewportHeight = window.innerHeight
  const scrollAmount = viewportHeight * 0.8
  const currentScrollPosition = window.scrollY + window.innerHeight
  const pageHeight = document.documentElement.scrollHeight

  const isAtBottom = currentScrollPosition >= pageHeight - 10

  if (isAtBottom) {
    if (currentPage.value >= pages.value.length - 1) {
      const currentIndex = chapters.value.findIndex(c => c.path === currentChapter.value?.path)
      if (currentIndex >= 0 && currentIndex < chapters.value.length - 1) {
        const nextChapter = chapters.value[currentIndex + 1]
        changeChapter(nextChapter.path)
      }
    } else {
      nextPage()
    }
  } else {
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth',
    })
  }
}

const updateURL = () => {
  if (!manga.value || !currentChapter.value) return

  router.replace({
    path: `/v/${manga.value.id}/chapter/${encodeURIComponent(currentChapter.value.path)}`,
    query: {
      page: currentPage.value.toString(),
    },
  })
}

const changeChapter = async (chapterPath: string) => {
  if (!manga.value) return

  router.push({
    path: `/v/${manga.value.id}/chapter/${encodeURIComponent(chapterPath)}`,
    query: { page: '0' },
  })
}

const nextPage = () => {
  if (readerStore.webtoonMode) {
    if (currentChapterIndex.value < chapters.value.length - 1) {
      changeChapter(chapters.value[currentChapterIndex.value + 1].path)
    }
    return
  }

  if (currentPage.value < pages.value.length - 1) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
}

const previousPage = () => {
  if (readerStore.webtoonMode) {
    if (currentChapterIndex.value > 0) {
      changeChapter(chapters.value[currentChapterIndex.value - 1].path)
    }
    return
  }

  if (currentPage.value > 0) {
    currentPage.value--
    if (window.scrollY > 10) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    }
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'instant' })
}

const handleBookmark = () => {
  if (!manga.value || !currentChapter.value) return
  bookmarkNote.value = ''
  bookmarkDialogOpen.value = true
}

const saveBookmark = async () => {
  if (!manga.value || !currentChapter.value) return

  try {
    await api.createBookmark(
      manga.value.id,
      currentChapter.value.path,
      currentPage.value,
      bookmarkNote.value || undefined
    )
    toast.success('Bookmark added!')
    bookmarkDialogOpen.value = false
    bookmarkNote.value = ''
  } catch (error) {
    console.error('Failed to create bookmark:', error)
    toast.error('Failed to add bookmark')
  }
}

watch(currentPage, () => {
  updateProgress()
  updatePageTitle()
  updateURL()
})

watch(
  () => [route.params.chapterId, route.query.page],
  async ([newChapterId, newPage], [oldChapterId, oldPage]) => {
    // If chapter changed, reload chapter data
    if (newChapterId !== oldChapterId) {
      await loadChapterData()
    }
    // If only page changed, update current page
    else if (newPage !== oldPage && newPage) {
      currentPage.value = parseInt(newPage as string)
    }
  }
)

const updatePageTitle = () => {
  if (manga.value && currentChapter.value) {
    if (pages.value.length > 0) {
      document.title = `${manga.value.title} - ${currentChapter.value.name} - Page ${currentPage.value + 1} | Manga Reader`
    } else {
      document.title = `${manga.value.title} - ${currentChapter.value.name} | Manga Reader`
    }
  }
}

const handleReaderAction = (event: CustomEvent) => {
  if (event.detail === 'chapters') {
    // Navigate back to manga info
    if (manga.value) {
      router.push(`/v/${manga.value.id}`)
    }
  } else if (event.detail === 'bookmark') {
    handleBookmark()
  }
}

onMounted(() => {
  loadChapterData()

  window.addEventListener('reader-action', handleReaderAction as EventListener)

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!currentChapter.value) return
    const tag = (event.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (event.key === 'ArrowLeft') {
      previousPage()
    } else if (event.key === 'ArrowRight') {
      nextPage()
    }
  })
})
</script>
