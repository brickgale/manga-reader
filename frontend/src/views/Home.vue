<template>
  <div>
    <!-- Recently Read Section -->
    <RecentReads />

    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-3xl font-bold">Library</h2>
        <Button
          variant="outline"
          @click="showScanInput = !showScanInput"
        >
          <Folder v-if="!showScanInput" class="h-4 w-4" />
          <X v-else class="h-4 w-4" />
          <span>Scan Directory</span>
        </Button>
      </div>
      
      <div v-if="showScanInput" class="flex gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
        <Input
          v-model="scanPath"
          type="text"
          placeholder="/manga"
          class="flex-1"
        />
        <Button
          @click="handleScan"
          :disabled="scanning"
        >
          {{ scanning ? 'Scanning...' : 'Scan' }}
        </Button>
      </div>
      
      <div v-if="savedDirectory" class="text-sm text-muted-foreground mb-4">
        Current directory: <span class="font-mono">{{ savedDirectory }}</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p>Loading manga...</p>
    </div>

    <div v-else-if="mangaList.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No manga found. Scan a directory to get started.</p>
    </div>

    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <router-link
        v-for="manga in mangaList"
        :key="manga.id"
        :to="`/manga/${manga.id}`"
      >
        <Card class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <div class="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
            <img 
              v-if="manga.coverImage" 
              :src="manga.coverImage" 
              :alt="manga.title"
              class="w-full h-full object-cover"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <p v-else class="text-muted-foreground">No Cover</p>
          </div>
          <CardHeader>
            <CardTitle class="truncate">{{ manga.title }}</CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <p class="text-sm text-muted-foreground truncate">{{ manga.path }}</p>
          </CardContent>
        </Card>
      </router-link>
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
        @update-page="(page) => { currentPage = page; loadManga() }"
        @update-page-size="(size) => { pageSize = size; currentPage = 1; loadManga() }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Folder, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { api, type Manga, type PaginationInfo } from '@/api'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { ListPagination } from '@/components/pagination'
import { RecentReads } from '@/components/reader'

const mangaList = ref<Manga[]>([])
const loading = ref(false)
const scanning = ref(false)
const scanPath = ref('/manga')
const showScanInput = ref(false)
const savedDirectory = ref<string>('')
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
    
    // Extract the parent directory from existing manga if available
    if (mangaList.value.length > 0) {
      const firstMangaPath = mangaList.value[0].path
      const parentDir = firstMangaPath.substring(0, firstMangaPath.lastIndexOf('/'))
      if (parentDir) {
        savedDirectory.value = parentDir
      }
    }
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
    
    savedDirectory.value = scanPath.value
    
    await loadManga()
    showScanInput.value = false
    toast.success(`Successfully scanned! Found ${result.length} manga.`)
  } catch (error: any) {
    console.error('Failed to scan directory:', error)
    const errorMsg = error.response?.data?.error || error.message || 'Unknown error'
    toast.error(`Failed to scan directory: ${errorMsg}`, {
      description: 'Make sure the path exists and is accessible.'
    })
  } finally {
    scanning.value = false
  }
}

onMounted(() => {
  loadManga()
})
</script>
