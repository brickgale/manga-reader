<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import type { Manga } from '@/api'

interface Props {
  manga: Manga
  index: number
  chapter?: string
  page?: number
  subtitle?: string
}

const props = defineProps<Props>()

const linkTo = computed(() => {
  if (props.chapter !== undefined && props.page !== undefined) {
    return {
      path: `/manga/${props.manga.id}`,
      query: { chapter: props.chapter, page: props.page.toString() },
    }
  }
  return `/manga/${props.manga.id}`
})

const displaySubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  if (props.manga.chapterCount !== undefined) {
    return `${props.manga.chapterCount} chapter${props.manga.chapterCount !== 1 ? 's' : ''}`
  }
  return 'Loading...'
})
</script>

<template>
  <router-link
    :to="linkTo"
    :class="[
      'group block transition-all duration-300 ease-out hover:scale-105 hover:z-10',
      index % 2 === 0 ? 'hover:rotate-2' : 'hover:-rotate-2',
    ]"
  >
    <Card class="overflow-hidden transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-primary/20 dark:group-hover:shadow-primary/30">
      <div class="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
        <img
          v-if="manga.coverImage"
          :src="manga.coverImage"
          :alt="manga.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          @error="e => ((e.target as HTMLImageElement).style.display = 'none')"
        />
        <p v-else class="text-muted-foreground">No Cover</p>
      </div>
      <CardHeader class="p-3 pb-0">
        <CardTitle class="truncate group-hover:text-primary transition-colors">{{
          manga.title
        }}</CardTitle>
      </CardHeader>
      <CardContent class="p-3 pt-1">
        <p class="text-xs text-muted-foreground truncate">
          {{ displaySubtitle }}
        </p>
      </CardContent>
    </Card>
  </router-link>
</template>
