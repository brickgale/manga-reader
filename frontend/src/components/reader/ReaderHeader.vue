<template>
  <div class="mb-4 flex items-center justify-between">
    <div class="flex flex-row flex-wrap items-center gap-2 pr-3">
      <h3 class="text-xl font-semibold">{{ currentChapter.name }}</h3>
      <p v-if="!webtoonMode" class="text-sm text-muted-foreground">
        Page {{ currentPage + 1 }} of {{ totalPages }}
      </p>
    </div>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            @click="$emit('toggle-view-mode')"
            :variant="webtoonMode ? 'default' : 'outline'"
            size="icon"
          >
            <GalleryVerticalEnd v-if="webtoonMode" class="h-5 w-5" />
            <BookOpen v-else class="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ webtoonMode ? 'Webtoon Mode' : 'Paging Mode' }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '@/api'
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { GalleryVerticalEnd, BookOpen } from 'lucide-vue-next'

defineProps<{
  currentChapter: Chapter
  currentPage: number
  totalPages: number
  webtoonMode: boolean
}>()

defineEmits<{
  'toggle-view-mode': []
}>()
</script>
