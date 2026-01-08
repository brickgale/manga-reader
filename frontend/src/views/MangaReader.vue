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
          <button
            v-for="chapter in chapters"
            :key="chapter.path"
            @click="selectChapter(chapter)"
            class="p-4 border rounded-lg hover:shadow-md transition-shadow text-left"
          >
            {{ chapter.name }}
          </button>
        </div>
      </div>

      <!-- Reader View -->
      <div v-else>
        <div class="mb-4 flex items-center justify-between">
          <button
            @click="currentChapter = null"
            class="px-4 py-2 border rounded-md hover:bg-muted"
          >
            ← Back to Chapters
          </button>
          <div class="flex gap-2">
            <button
              @click="handleBookmark"
              class="px-4 py-2 border rounded-md hover:bg-muted"
            >
              🔖 Bookmark
            </button>
          </div>
        </div>

        <div class="mb-4 text-center">
          <h3 class="text-xl font-semibold">{{ currentChapter.name }}</h3>
          <p class="text-sm text-muted-foreground">
            Page {{ currentPage + 1 }} of {{ pages.length }}
          </p>
        </div>

        <div v-if="pages.length > 0" class="flex justify-center mb-4">
          <img
            :src="api.getImageUrl(pages[currentPage].path)"
            :alt="`Page ${currentPage + 1}`"
            class="max-w-full h-auto"
            @click="nextPage"
          />
        </div>

        <div class="flex justify-center gap-4">
          <button
            @click="previousPage"
            :disabled="currentPage === 0"
            class="px-6 py-2 border rounded-md hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === pages.length - 1"
            class="px-6 py-2 border rounded-md hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api, type Manga, type Chapter, type Page, type ReadingProgress } from '../api'

const route = useRoute()
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
    const allManga = await api.getManga()
    manga.value = allManga.find(m => m.id === mangaId) || null
    
    if (manga.value) {
      chapters.value = await api.getChapters(manga.value.id)
      progress.value = await api.getProgress(manga.value.id)
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

const nextPage = () => {
  if (currentPage.value < pages.value.length - 1) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
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
    alert('Bookmark added!')
  } catch (error) {
    console.error('Failed to create bookmark:', error)
  }
}

watch(currentPage, () => {
  updateProgress()
})

onMounted(() => {
  loadMangaDetails()
})
</script>
