<template>
  <div
    v-if="pages.length > 0"
    class="flex flex-col justify-center items-center mb-4 border-1 border-white"
  >
    <template v-if="chapterViewMode">
      <LoadingIcon v-if="!allImagesLoaded" />
      <template v-else>
        <img
          v-for="(page, idx) in pages"
          :key="page.path"
          :src="getImageUrl(page.path)"
          :alt="`Page ${idx + 1}`"
          class="max-w-[980px] w-full h-auto cursor-pointer"
          @click="$emit('page-click')"
        />
      </template>
      <!-- Hidden images for preloading -->
      <div v-show="false">
        <img
          v-for="(page, idx) in pages"
          :key="`preload-${page.path}`"
          :src="getImageUrl(page.path)"
          :alt="`Preload ${idx + 1}`"
          @load="handleImageLoad(idx)"
          @error="handleImageError(idx)"
        />
      </div>
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
import { ref, computed, watch } from 'vue'
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

const allImagesLoaded = computed(() => {
  if (!props.chapterViewMode || props.pages.length === 0) return true

  const totalLoaded = Object.keys(loadedImages.value).length
  return totalLoaded === props.pages.length
})

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
