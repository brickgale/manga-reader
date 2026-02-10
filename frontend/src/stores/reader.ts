import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReaderStore = defineStore('reader', () => {
  const chapterViewMode = ref(false)

  // Initialize from localStorage
  const saved = localStorage.getItem('chapterViewMode')
  if (saved !== null) {
    chapterViewMode.value = saved === 'true'
  }

  const toggleChapterViewMode = () => {
    chapterViewMode.value = !chapterViewMode.value
    localStorage.setItem('chapterViewMode', String(chapterViewMode.value))
  }

  const setChapterViewMode = (value: boolean) => {
    chapterViewMode.value = value
    localStorage.setItem('chapterViewMode', String(value))
  }

  return {
    chapterViewMode,
    toggleChapterViewMode,
    setChapterViewMode
  }
})
