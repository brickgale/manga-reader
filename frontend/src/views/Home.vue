<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-3xl font-bold">Manga Library</h2>
        <button
          @click="showScanInput = !showScanInput"
          class="px-4 py-2 border rounded-md hover:bg-muted flex items-center gap-2"
        >
          <span>{{ showScanInput ? '✕' : '⚙️' }}</span>
          <span>{{ showScanInput ? 'Close' : 'Scan Directory' }}</span>
        </button>
      </div>
      
      <div v-if="showScanInput" class="flex gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
        <input
          v-model="scanPath"
          type="text"
          placeholder="Enter manga directory path..."
          class="flex-1 px-4 py-2 border rounded-md bg-background"
        />
        <button
          @click="handleScan"
          :disabled="scanning"
          class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {{ scanning ? 'Scanning...' : 'Scan' }}
        </button>
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

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <router-link
        v-for="manga in mangaList"
        :key="manga.id"
        :to="`/manga/${manga.id}`"
        class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div class="aspect-[3/4] bg-muted flex items-center justify-center">
          <p class="text-muted-foreground">No Cover</p>
        </div>
        <div class="p-4">
          <h3 class="font-semibold truncate">{{ manga.title }}</h3>
          <p class="text-sm text-muted-foreground truncate">{{ manga.path }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type Manga } from '../api'

const mangaList = ref<Manga[]>([])
const loading = ref(false)
const scanning = ref(false)
const scanPath = ref('')
const showScanInput = ref(false)
const savedDirectory = ref<string>('')

const loadManga = async () => {
  loading.value = true
  try {
    mangaList.value = await api.getManga()
  } catch (error) {
    console.error('Failed to load manga:', error)
  } finally {
    loading.value = false
  }
}

const handleScan = async () => {
  if (!scanPath.value.trim()) {
    alert('Please enter a directory path')
    return
  }
  
  console.log('Scanning directory:', scanPath.value)
  scanning.value = true
  try {
    const result = await api.scanDirectory(scanPath.value)
    console.log('Scan result:', result)
    
    // Save the directory to localStorage
    localStorage.setItem('mangaDirectory', scanPath.value)
    savedDirectory.value = scanPath.value
    
    await loadManga()
    showScanInput.value = false
    alert(`Successfully scanned! Found ${result.length} manga.`)
  } catch (error: any) {
    console.error('Failed to scan directory:', error)
    const errorMsg = error.response?.data?.error || error.message || 'Unknown error'
    alert(`Failed to scan directory: ${errorMsg}\nMake sure the path exists and is accessible.`)
  } finally {
    scanning.value = false
  }
}

onMounted(() => {
  // Load saved directory from localStorage
  const saved = localStorage.getItem('mangaDirectory')
  if (saved) {
    savedDirectory.value = saved
    scanPath.value = saved
  }
  loadManga()
})
</script>
