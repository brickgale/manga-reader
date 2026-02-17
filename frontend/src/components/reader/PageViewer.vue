<template>
  <div v-if="pages.length > 0" class="flex flex-col justify-center mb-4">
    <template v-if="chapterViewMode">
      <img
        v-for="(page, idx) in pages"
        :key="page.path"
        :src="getImageUrl(page.path)"
        :alt="`Page ${idx + 1}`"
        class="max-w-full h-auto cursor-pointer"
        @click="$emit('page-click')"
      />
    </template>
    <img
      v-else
      :src="getImageUrl(pages[currentPage].path)"
      :alt="`Page ${currentPage + 1}`"
      class="max-w-full h-auto cursor-pointer"
      @click="$emit('page-click')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Page } from '@/api'
import { api } from '@/api'

defineProps<{
  pages: Page[]
  currentPage: number
  chapterViewMode: boolean
}>()

defineEmits<{
  'page-click': []
}>()

const getImageUrl = (path: string) => api.getImageUrl(path)
</script>
