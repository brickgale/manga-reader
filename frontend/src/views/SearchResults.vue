<template>
  <div>
    <div class="mb-6">
      <div class="flex items-start justify-between mb-4">
        <h2 class="text-lg sm:text-2xl flex items-center gap-2">
          <Search class="w-5 h-5 sm:w-6 sm:h-6" />
          Search Results for "{{ searchQuery }}"
        </h2>
      </div>

      <div v-if="searchQuery" class="mb-4 text-sm text-muted-foreground">
        Found {{ pagination?.totalItems || 0 }} manga matching your search
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <MangaCardSkeleton v-for="n in pageSize" :key="n" />
    </div>

    <div v-else-if="mangaList.length === 0" class="text-center py-8 text-muted-foreground">
      <div class="flex flex-col items-center gap-4">
        <Search class="w-16 h-16 opacity-20" />
        <div>
          <p class="text-lg font-medium">No manga found matching "{{ searchQuery }}"</p>
          <p class="text-sm mt-2">Try a different search term or check your spelling</p>
        </div>
        <Button variant="outline" @click="$router.push('/')">
          <Library class="h-4 w-4" />
          <span>Back to Library</span>
        </Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <MangaCard
        v-for="(manga, index) in mangaList"
        :key="manga.id"
        :manga="manga"
        :index="index"
      />
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1">
      <ListPagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total-pages="pagination.totalPages"
        :total-items="pagination.totalItems"
        :has-next="pagination.hasNext"
        :has-prev="pagination.hasPrev"
        @update-page="
          page => {
            currentPage = page
            router.push({ query: { ...route.query, page: page > 1 ? String(page) : undefined } })
          }
        "
        @update-page-size="
          size => {
            pageSize = size
            currentPage = 1
            const shouldReload = route.query.page === undefined
            router.push({ query: { ...route.query, page: undefined } })
            if (shouldReload) {
              loadSearchResults()
            }
          }
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Library } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { api, type Manga, type PaginationInfo } from '@/api'
import { Button } from '@/components/ui'
import { ListPagination } from '@/components/pagination'
import { MangaCard, MangaCardSkeleton } from '@/components/manga-card'
import { withMinimumLoadingTime } from '@/composables/useLoadingHelper'

const route = useRoute()
const router = useRouter()

const mangaList = ref<Manga[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const pagination = ref<PaginationInfo | null>(null)
const searchQuery = ref('')
let requestId = 0

// Initialize from URL params
if (route.query.q) {
  searchQuery.value = String(route.query.q)
}
if (route.query.page) {
  currentPage.value = parseInt(String(route.query.page), 10)
}

const loadSearchResults = async () => {
  if (!searchQuery.value) {
    // Redirect to home if no search query
    router.push('/')
    return
  }

  loading.value = true
  const currentId = ++requestId

  try {
    const response = await withMinimumLoadingTime(() =>
      api.searchManga(searchQuery.value, currentPage.value, pageSize.value)
    )

    if (currentId !== requestId) return

    mangaList.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    if (currentId !== requestId) return
    console.error('Failed to search manga:', error)
    toast.error('Failed to search manga')
  } finally {
    if (currentId === requestId) {
      loading.value = false
    }
  }
}

// Watch for route query changes
watch(
  () => route.query,
  newQuery => {
    const newSearch = newQuery.q ? String(newQuery.q) : ''
    const newPage = newQuery.page ? parseInt(String(newQuery.page), 10) : 1

    // Update local state
    if (searchQuery.value !== newSearch) {
      searchQuery.value = newSearch
      currentPage.value = 1 // Reset to page 1 on new search
    } else if (currentPage.value !== newPage) {
      currentPage.value = newPage
    }

    // Reload search results
    loadSearchResults()
  }
)

onMounted(() => {
  loadSearchResults()
})
</script>
