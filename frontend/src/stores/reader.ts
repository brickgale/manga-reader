import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReaderStore = defineStore('reader', () => {
  const webtoonMode = ref(false)

  // Initialize from localStorage, migrating legacy 'chapterViewMode' key if needed
  const saved = localStorage.getItem('webtoonMode')
  if (saved !== null) {
    webtoonMode.value = saved === 'true'
  } else {
    const legacySaved = localStorage.getItem('chapterViewMode')
    if (legacySaved !== null) {
      webtoonMode.value = legacySaved === 'true'
      localStorage.setItem('webtoonMode', String(webtoonMode.value))
    }
  }

  const toggleWebtoonMode = () => {
    webtoonMode.value = !webtoonMode.value
    localStorage.setItem('webtoonMode', String(webtoonMode.value))
  }

  const setWebtoonMode = (value: boolean) => {
    webtoonMode.value = value
    localStorage.setItem('webtoonMode', String(value))
  }

  return {
    webtoonMode,
    toggleWebtoonMode,
    setWebtoonMode,
  }
})
