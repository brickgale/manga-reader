<template>
  <div
    v-if="show"
    class="fixed top-0 left-0 right-0 z-[100] h-1 bg-primary/20"
  >
    <div
      class="h-full bg-primary transition-all duration-150 ease-out"
      :style="{ width: `${scrollProgress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const scrollProgress = ref(0)

const updateScrollProgress = () => {
  if (!props.show) return

  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY

  // Calculate scroll percentage
  const maxScroll = documentHeight - windowHeight
  const percentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
  
  scrollProgress.value = Math.min(Math.max(percentage, 0), 100)
}

onMounted(() => {
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
  updateScrollProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress)
})

// Update immediately when show prop changes
watch(() => props.show, (newShow) => {
  if (newShow) {
    updateScrollProgress()
  } else {
    scrollProgress.value = 0
  }
})
</script>
