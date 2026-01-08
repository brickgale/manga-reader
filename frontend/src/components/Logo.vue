<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  width?: number
  height?: number
  class?: string
}>(), {
  width: 32,
  height: 32
})

const viewBox = computed(() => '0 0 100 100')
</script>

<template>
  <svg 
    :width="width" 
    :height="height" 
    :viewBox="viewBox" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class"
  >
    <rect x="20" y="15" width="60" height="70" rx="5" stroke="currentColor" stroke-width="5"/>
    <rect x="30" y="25" width="40" height="10" fill="currentColor"/>
    <rect x="30" y="40" width="40" height="25" fill="currentColor" opacity="0.3"/>
    <rect x="30" y="70" width="20" height="5" fill="currentColor"/>
    <path d="M65 15V35L72.5 30L80 35V15H65Z" fill="currentColor"/>
  </svg>
</template>
