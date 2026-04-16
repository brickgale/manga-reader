<script setup lang="ts">
import { inject } from 'vue'

const drawer = inject<{
  isOpen: { value: boolean }
  setOpen: (value: boolean) => void
}>('drawer')

const handleClick = () => {
  drawer?.setOpen(true)
}
</script>

<template>
  <div @click="handleClick">
    <slot />
  </div>
</template>
