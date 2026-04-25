import { ref } from 'vue'

// Global loading state that can be accessed across components
const isPageLoading = ref(false)
const loadingPromises = new Set<Promise<any>>()

export function usePageLoading() {
  const startLoading = () => {
    isPageLoading.value = true
  }

  const finishLoading = () => {
    isPageLoading.value = false
  }

  const trackPromise = async <T>(promise: Promise<T>): Promise<T> => {
    isPageLoading.value = true
    loadingPromises.add(promise)

    try {
      const result = await promise
      return result
    } finally {
      loadingPromises.delete(promise)
      
      // Only finish loading when all promises are done
      if (loadingPromises.size === 0) {
        isPageLoading.value = false
      }
    }
  }

  return {
    isPageLoading,
    startLoading,
    finishLoading,
    trackPromise,
  }
}
