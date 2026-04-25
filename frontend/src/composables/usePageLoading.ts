import { ref } from 'vue'

// Global loading state that can be accessed across components
const isPageLoading = ref(false)
const loadingPromises = new Set<Promise<any>>()
let manualLoadingCount = 0

const updateLoadingState = () => {
  isPageLoading.value = manualLoadingCount > 0 || loadingPromises.size > 0
}

export function usePageLoading() {
  const startLoading = () => {
    manualLoadingCount += 1
    updateLoadingState()
  }

  const finishLoading = () => {
    if (manualLoadingCount > 0) {
      manualLoadingCount -= 1
    }
    updateLoadingState()
  }

  const trackPromise = async <T>(promiseFactory: () => Promise<T>): Promise<T> => {
    // Use Promise.resolve().then() so a synchronous throw from promiseFactory
    // is captured as a rejected promise, guaranteeing the finally cleanup runs
    const promise = Promise.resolve().then(promiseFactory)
    loadingPromises.add(promise)
    updateLoadingState()

    try {
      const result = await promise
      return result
    } finally {
      loadingPromises.delete(promise)
      updateLoadingState()
    }
  }

  return {
    isPageLoading,
    startLoading,
    finishLoading,
    trackPromise,
  }
}
