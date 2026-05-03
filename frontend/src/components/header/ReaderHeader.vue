<template>
  <header
    data-reader-header
    class="fixed top-0 left-0 right-0 lg:left-64 z-[45] h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <!-- Top Row: Chapter Info + View Mode Toggle -->
    <div
      class="w-full px-2 sm:px-4 lg:container lg:mx-auto flex items-center justify-between gap-2"
    >
      <!-- Left: Sidebar Toggle (Mobile) + Chapter Info -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink overflow-hidden">
        <Button
          variant="outline"
          size="icon"
          class="lg:hidden flex-shrink-0 h-9 w-9"
          @click="$emit('toggle-sidebar')"
        >
          <Menu class="h-4 w-4" />
        </Button>

        <div class="flex items-center gap-2 min-w-0 max-w-full md:max-w-[400px]">
          <router-link
            :to="`/v/${mangaId}`"
            class="flex items-center border rounded-full px-4 h-8 bg-background hover:bg-accent hover:text-accent-foreground transition-colors min-w-0 w-full"
          >
            <span class="text-xs sm:text-sm truncate block">{{ mangaTitle }}</span>
          </router-link>
        </div>
      </div>

      <!-- Pagination wrapper with responsive layout -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <slot name="pagination" />

        <!-- Right: View Mode Toggle -->
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                @click="$emit('toggle-view-mode')"
                :variant="webtoonMode ? 'default' : 'outline'"
                size="icon"
                class="h-9 w-9 flex-shrink-0"
              >
                <GalleryVerticalEnd v-if="webtoonMode" class="h-4 w-4" />
                <BookOpen v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{{ webtoonMode ? 'Webtoon Mode' : 'Page Mode' }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Menu, GalleryVerticalEnd, BookOpen } from 'lucide-vue-next'

defineProps<{
  mangaTitle: string
  mangaId: string
  currentPage: number
  totalPages: number
  webtoonMode: boolean
}>()

defineEmits<{
  'toggle-sidebar': []
  'toggle-view-mode': []
}>()
</script>
