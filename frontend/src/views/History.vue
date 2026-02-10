<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Reading History</h2>

    <div v-if="loading" class="text-center py-8">
      <p>Loading history...</p>
    </div>

    <div v-else-if="history.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No reading history yet.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in history"
        :key="item.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <router-link
          :to="`/manga/${item.mangaId}`"
          class="block"
        >
          <h3 class="font-semibold text-lg mb-2">{{ item.manga?.title }}</h3>
          <p class="text-sm text-muted-foreground mb-1">
            Chapter: {{ item.chapterPath.split('/').pop() }}
          </p>
          <p class="text-sm text-muted-foreground mb-1">
            Page: {{ item.pageNumber }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ new Date(item.timestamp).toLocaleString() }}
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type ReadingHistory } from '@/api'

const history = ref<ReadingHistory[]>([])
const loading = ref(false)

const loadHistory = async () => {
  loading.value = true
  try {
    const response = await api.getHistory()
    history.value = response.data
  } catch (error) {
    console.error('Failed to load history:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHistory()
})
</script>
