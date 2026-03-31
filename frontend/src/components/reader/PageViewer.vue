<template>
  <div
    v-if="pages.length > 0"
    class="flex flex-col justify-center items-center mb-4 border-1 border-white"
  >
    <template v-if="chapterViewMode">
      <template v-for="(page, idx) in pages" :key="page.path">
        <LoadingIcon v-if="!loadedImages[idx]" />
        <img
          v-show="loadedImages[idx]"
          :src="getImageUrl(page.path)"
          :alt="`Page ${idx + 1}`"
          class="max-w-[980px] w-full h-auto cursor-pointer"
          @load="handleImageLoad(idx)"
          @error="handleImageError(idx)"
          @click="$emit('page-click')"
        />
      </template>
    </template>
    <img
      v-else
      :src="getImageUrl(pages[currentPage].path)"
      :alt="`Page ${currentPage + 1}`"
      class="max-w-[980px] w-full h-auto cursor-pointer"
      @click="$emit('page-click')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { Page } from '@/api'
import { api } from '@/api'
import { LoadingIcon } from '@/components/loading-icon'

const props = defineProps<{
  pages: Page[]
  currentPage: number
  chapterViewMode: boolean
}>()

defineEmits<{
  'page-click': []
}>()

const loadedImages = ref<Record<number, boolean>>({})
const erroredImages = ref<Set<number>>(new Set())

const getImageUrl = (path: string) => api.getImageUrl(path)

const handleImageLoad = (index: number) => {
  loadedImages.value[index] = true
}

const handleImageError = (index: number) => {
  if (!erroredImages.value.has(index)) {
    erroredImages.value.add(index)
    toast.error(`Failed to load image ${index + 1}`)
  }
  // Still mark as "loaded" to prevent infinite waiting
  loadedImages.value[index] = true
}

// Reset loaded images when pages change
watch(
  () => props.pages,
  () => {
    loadedImages.value = {}
    erroredImages.value = new Set()
  },
  { immediate: true }
)

// Reset loaded images when switching view modes
watch(
  () => props.chapterViewMode,
  () => {
    if (props.chapterViewMode) {
      loadedImages.value = {}
      erroredImages.value = new Set()
    }
  }
)
</script>
