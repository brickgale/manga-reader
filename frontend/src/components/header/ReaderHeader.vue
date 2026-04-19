<template>
  <header
    class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <!-- Top Row: Chapter Info + View Mode Toggle -->
    <div class="container mx-auto h-14 px-4 flex items-center justify-between gap-2 border-b">
      <!-- Left: Sidebar Toggle (Mobile) + Chapter Info -->
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden flex-shrink-0"
          @click="$emit('toggle-sidebar')"
        >
          <Menu class="h-5 w-5" />
        </Button>

        <div class="flex items-center gap-2 min-w-0">
          <h3 class="text-base font-semibold truncate">{{ chapterName }}</h3>
          <p v-if="!webtoonMode" class="text-sm text-muted-foreground whitespace-nowrap">
            Page {{ currentPage + 1 }}/{{ totalPages }}
          </p>
        </div>
      </div>

      <slot name="pagination" />

      <!-- Right: View Mode Toggle -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              @click="$emit('toggle-view-mode')"
              :variant="webtoonMode ? 'default' : 'outline'"
              size="icon"
            >
              <GalleryVerticalEnd v-if="webtoonMode" class="h-5 w-5 dark:text-black" />
              <BookOpen v-else class="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ webtoonMode ? 'Webtoon Mode' : 'Page Mode' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Menu, GalleryVerticalEnd, BookOpen } from 'lucide-vue-next'

defineProps<{
  chapterName: string
  currentPage: number
  totalPages: number
  webtoonMode: boolean
}>()

defineEmits<{
  'toggle-sidebar': []
  'toggle-view-mode': []
}>()
</script>
