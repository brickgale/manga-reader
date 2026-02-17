<template>
  <div class="mb-4 flex items-center justify-between">
    <div class="flex flex-row justify-center items-center gap-2">
      <h3 class="text-xl font-semibold">{{ currentChapter.name }}</h3>
      <p v-if="!chapterViewMode" class="text-sm text-muted-foreground">
        Page {{ currentPage + 1 }} of {{ totalPages }}
      </p>
    </div>
    <Button
      @click="$emit('toggle-view-mode')"
      :variant="chapterViewMode ? 'default' : 'outline'"
      size="sm"
    >
      {{ chapterViewMode ? 'Single Page' : 'Chapter View' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '@/api'
import { Button } from '@/components/ui'

defineProps<{
  currentChapter: Chapter
  currentPage: number
  totalPages: number
  chapterViewMode: boolean
}>()

defineEmits<{
  'toggle-view-mode': []
}>()
</script>
