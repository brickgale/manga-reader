<template>
  <header
    data-reader-header
    class="sticky top-0 z-40 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <!-- Top Row: Chapter Info + View Mode Toggle -->
    <div class="w-full px-4 lg:container lg:mx-auto flex items-center justify-between gap-2">
      <!-- Left: Sidebar Toggle (Mobile) + Chapter Info -->
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <Button
          variant="outline"
          size="icon"
          class="lg:hidden flex-shrink-0"
          @click="$emit('toggle-sidebar')"
        >
          <Menu class="h-5 w-5" />
        </Button>

        <div class="flex items-center gap-2 min-w-0">
          <router-link
            :to="`/v/${mangaId}`"
            class="items-center text-sm truncate border rounded-full px-4 py-1.5 bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {{ mangaTitle }}
          </router-link>
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
              <GalleryVerticalEnd v-if="webtoonMode" class="h-5 w-5" />
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
