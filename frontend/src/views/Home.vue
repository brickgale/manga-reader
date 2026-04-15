<template>
  <div>
    <!-- Recently Read Section -->
    <RecentReads />

    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl flex items-center gap-2">
          <Library class="w-6 h-6" />
          Library
        </h2>
        <Button variant="outline" @click="showScanInput = !showScanInput">
          <Folder v-if="!showScanInput" class="h-4 w-4" />
          <X v-else class="h-4 w-4" />
          <span>Scan Directory</span>
        </Button>
      </div>

      <div v-if="showScanInput" class="flex gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
        <Input v-model="scanPath" type="text" placeholder="/manga" class="flex-1" />
        <Button @click="handleScan" :disabled="scanning">
          {{ scanning ? 'Scanning...' : 'Scan' }}
        </Button>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <MangaCardSkeleton v-for="n in pageSize" :key="n" />
    </div>

    <div v-else-if="mangaList.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No manga found. Scan a directory to get started.</p>
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
    <div v-if="pagination">
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
            loadManga()
          }
        "
        @update-page-size="
          size => {
            pageSize = size
            currentPage = 1
            loadManga()
          }
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Folder, X, Library } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { api, type Manga, type PaginationInfo } from '@/api'
import { Button, Input } from '@/components/ui'
import { ListPagination } from '@/components/pagination'
import { RecentReads } from '@/components/reader'
import { MangaCard, MangaCardSkeleton } from '@/components/manga-card'

const mangaList = ref<Manga[]>([])
const loading = ref(false)
const scanning = ref(false)
const scanPath = ref('/manga')
const showScanInput = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const pagination = ref<PaginationInfo | null>(null)

console.log(scanPath.value, '--- initial scan path ---')

const loadManga = async () => {
  loading.value = true
  try {
    const response = await api.getManga(currentPage.value, pageSize.value)
    mangaList.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load manga:', error)
  } finally {
    loading.value = false
  }
}

const handleScan = async () => {
  if (!scanPath.value.trim()) {
    toast.error('Please enter a directory path')
    return
  }

  console.log('Scanning directory:', scanPath.value)
  scanning.value = true
  try {
    const result = await api.scanDirectory(scanPath.value)
    console.log('Scan result:', result)

    await loadManga()
    showScanInput.value = false
    toast.success(`Successfully scanned! Found ${result.length} manga.`)
  } catch (error: any) {
    console.error('Failed to scan directory:', error)
    const errorMsg = error.response?.data?.error || error.message || 'Unknown error'
    toast.error(`Failed to scan directory: ${errorMsg}`, {
      description: 'Make sure the path exists and is accessible.',
    })
  } finally {
    scanning.value = false
  }
}

onMounted(() => {
  loadManga()
})
</script>
