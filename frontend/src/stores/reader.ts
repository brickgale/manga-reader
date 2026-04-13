import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReaderStore = defineStore('reader', () => {
  const webtoonMode = ref(false)

  // Initialize from localStorage
  const saved = localStorage.getItem('webtoonMode')
  if (saved !== null) {
    webtoonMode.value = saved === 'true'
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
