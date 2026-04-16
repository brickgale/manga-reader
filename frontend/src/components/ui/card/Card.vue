<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  hasHoverEffect?: boolean
}>()
</script>

<template>
  <div
    :class="
      cn(
        'rounded-sm border bg-card text-card-foreground shadow',
        props.hasHoverEffect &&
          'hover:border-primary hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-all cursor-pointer',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
