<template>
  <div
    v-if="pages.length > 0"
    class="flex flex-col justify-center items-center mb-4 border-1 border-white"
  >
    <template v-if="webtoonMode">
      <LoadingIcon v-if="!allImagesLoaded" class="h-[calc(100vh-280px)]" />
      <template v-else>
        <img
          v-for="(page, idx) in pages"
          :key="page.path"
          :src="getImageUrl(page.path)"
          :alt="`Page ${idx + 1}`"
          :data-page-index="idx"
          :class="[
            'max-w-[980px] w-full h-auto cursor-pointer transition-opacity duration-500',
            loadedImages[idx] ? 'opacity-100' : 'opacity-0',
          ]"
          @click="$emit('page-click')"
          @load="handleImageLoad(idx)"
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
      :class="[
        'max-w-[980px] w-full h-auto cursor-pointer transition-opacity duration-500',
        pageImageLoaded ? 'opacity-100' : 'opacity-0',
      ]"
      @click="$emit('page-click')"
      @load="handlePageImageLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import type { Page } from '@/api'
import { api } from '@/api'
import { LoadingIcon } from '@/components/loading-icon'

const props = defineProps<{
  pages: Page[]
  currentPage: number
  webtoonMode: boolean
}>()

const emit = defineEmits<{
  'page-click': []
  'images-loaded': []
}>()

const loadedImages = ref<Record<number, boolean>>({})
const erroredImages = ref<Set<number>>(new Set())
const pageImageLoaded = ref(false)

const getImageUrl = (path: string) => api.getImageUrl(path)

const allImagesLoaded = computed(() => {
  if (!props.webtoonMode || props.pages.length === 0) return true

  const totalLoaded = Object.keys(loadedImages.value).length
  return totalLoaded === props.pages.length
})

const handleImageLoad = (index: number) => {
  loadedImages.value[index] = true
}

const handlePageImageLoad = () => {
  pageImageLoaded.value = true
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
    pageImageLoaded.value = false
  },
  { immediate: true }
)

// Reset loaded images when switching view modes
watch(
  () => props.webtoonMode,
  () => {
    if (props.webtoonMode) {
      loadedImages.value = {}
      erroredImages.value = new Set()
    } else {
      pageImageLoaded.value = false
    }
  }
)

// Reset page image loaded state when current page changes
watch(
  () => props.currentPage,
  () => {
    if (!props.webtoonMode) {
      pageImageLoaded.value = false
    }
  }
)

// Emit when all images are loaded in webtoon mode
watch(
  () => allImagesLoaded.value,
  async (loaded) => {
    if (loaded && props.webtoonMode && props.pages.length > 0) {
      await nextTick()
      emit('images-loaded')
    }
  },
  { flush: 'post' }
)
</script>
