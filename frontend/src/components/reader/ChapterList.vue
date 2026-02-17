<template>
  <div>
    <h3 class="text-xl font-semibold mb-4">Chapters</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Button
        v-for="chapter in chapters"
        :key="chapter.path"
        @click="$emit('select', chapter)"
        variant="outline"
        class="h-auto p-4 justify-start"
      >
        {{ chapter.name }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '@/api'
import { Button } from '@/components/ui'

defineProps<{
  chapters: Chapter[]
}>()

defineEmits<{
  select: [chapter: Chapter]
}>()
</script>
