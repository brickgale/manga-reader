<template>
  <div class="mb-4 flex items-center justify-between">
    <div class="flex flex-row flex-wrap items-center gap-2 pr-3">
      <h3 class="text-xl font-semibold">{{ currentChapter.name }}</h3>
      <p v-if="!chapterViewMode" class="text-sm text-muted-foreground">
        Page {{ currentPage + 1 }} of {{ totalPages }}
      </p>
    </div>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            @click="$emit('toggle-view-mode')"
            :variant="chapterViewMode ? 'default' : 'outline'"
            size="icon"
          >
            <BookOpen v-if="chapterViewMode" class="h-5 w-5" />
            <FileText v-else class="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ chapterViewMode ? 'Chapter View' : 'Page View' }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '@/api'
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BookOpen, FileText } from 'lucide-vue-next'

defineProps<{
  currentChapter: Chapter
  currentPage: number
  totalPages: number
  chapterViewMode: boolean
}>()

defineEmits<{
  'toggle-view-mode': []
}>()
</script>
