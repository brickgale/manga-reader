<template>
  <div class="mb-6">
    <h2 class="text-3xl font-bold mb-4">{{ manga.title }}</h2>
    
    <div v-if="progress" class="mb-6 p-4 bg-muted rounded-lg">
      <p class="text-sm mb-2">
        <strong>Last Read:</strong> Chapter {{ progress.lastChapterPath.split('/').pop() }}, Page {{ progress.lastPageNumber + 1 }}
      </p>
      <p class="text-sm">
        <strong>Farthest:</strong> Chapter {{ progress.farthestChapterPath.split('/').pop() }}, Page {{ progress.farthestPageNumber + 1 }}
      </p>
      <button
        @click="$emit('resume')"
        class="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Resume Reading
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Manga, ReadingProgress } from '@/api'

defineProps<{
  manga: Manga
  progress: ReadingProgress | null
}>()

defineEmits<{
  resume: []
}>()
</script>
