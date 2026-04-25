<template>
  <div
    v-if="isLoading"
    class="fixed top-0 left-0 right-0 z-[100] h-1 bg-primary/20"
  >
    <div
      class="h-full bg-primary transition-all duration-300 ease-out"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePageLoading } from '@/composables/usePageLoading'

const router = useRouter()
const { isPageLoading } = usePageLoading()
const isLoading = ref(false)
const progress = ref(0)

let progressInterval: ReturnType<typeof setInterval> | null = null
let waitingForPageLoad = false

const startProgress = () => {
  isLoading.value = true
  progress.value = 0
  waitingForPageLoad = true

  // Simulate progress
  if (progressInterval) clearInterval(progressInterval)
  
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      // Slow down as we approach 90%
      const increment = progress.value < 30 ? 10 : progress.value < 60 ? 5 : 2
      progress.value = Math.min(progress.value + increment, 90)
    }
  }, 200)
}

const completeProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  
  progress.value = 100
  
  setTimeout(() => {
    isLoading.value = false
    progress.value = 0
    waitingForPageLoad = false
  }, 300)
}

// Listen to route changes
router.beforeEach((to, from, next) => {
  if (to.path !== from.path) {
    startProgress()
  }
  next()
})

router.afterEach(() => {
  // Don't complete immediately, wait for page loading to finish
  // Set a timeout to check page loading state
  setTimeout(() => {
    if (!isPageLoading.value) {
      completeProgress()
    }
  }, 100)
})

// Watch for page loading to complete
watch(isPageLoading, (loading) => {
  if (!loading && waitingForPageLoad && isLoading.value) {
    completeProgress()
  }
})

// Watch for errors to complete progress
router.onError(() => {
  completeProgress()
})
</script>
