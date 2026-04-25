<template>
  <div
    v-if="show"
    class="fixed top-0 left-0 right-0 z-[100] h-1 bg-primary/20"
  >
    <div
      class="h-full bg-primary transition-all duration-150 ease-out"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  show: boolean
  mode: 'scroll' | 'page'
  currentPage?: number
  totalPages?: number
}>()

const scrollProgress = ref(0)

const progress = computed(() => {
  if (props.mode === 'page') {
    // Page-based progress
    if (!props.totalPages || props.totalPages === 0) return 0
    const pageProgress = ((props.currentPage ?? 0) + 1) / props.totalPages * 100
    return Math.min(Math.max(pageProgress, 0), 100)
  } else {
    // Scroll-based progress
    return scrollProgress.value
  }
})

const updateScrollProgress = () => {
  if (!props.show || props.mode !== 'scroll') return

  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY

  // Calculate scroll percentage
  const maxScroll = documentHeight - windowHeight
  const percentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
  
  scrollProgress.value = Math.min(Math.max(percentage, 0), 100)
}

onMounted(() => {
  if (props.show && props.mode === 'scroll') {
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    updateScrollProgress()
  }
})

onUnmounted(() => {
  if (props.mode === 'scroll') {
    window.removeEventListener('scroll', updateScrollProgress)
  }
})

// Update when mode or show changes
watch(() => [props.show, props.mode], ([newShow, newMode]) => {
  if (newShow && newMode === 'scroll') {
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    updateScrollProgress()
  } else {
    window.removeEventListener('scroll', updateScrollProgress)
  }

  if (!newShow) {
    scrollProgress.value = 0
  }
})
</script>
