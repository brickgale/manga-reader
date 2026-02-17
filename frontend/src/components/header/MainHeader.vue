<template>
  <nav class="border-b">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo :width="36" :height="36" class="-ml-[6px]" />
          <span class="text-2xl font-bold hidden md:inline-block">Manga Reader</span>
        </router-link>
        <div class="flex items-center gap-2">
          <TooltipProvider>
            <!-- Reader Controls -->
            <Tooltip v-for="item in readerActions" :key="item.label" v-if="isReaderPage">
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="emitReaderAction(item.action)"
                >
                  <component :is="item.icon" class="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ item.label }}</p>
              </TooltipContent>
            </Tooltip>

            <!-- Navigation Links -->
            <Tooltip v-for="item in navItems" :key="item.label">
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  as-child
                >
                  <router-link :to="item.to">
                    <component :is="item.icon" class="h-5 w-5" />
                  </router-link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ item.label }}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger as-child>
                <ThemeToggle />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { History, Bookmark, List, BookmarkPlus } from 'lucide-vue-next'
import { Button } from '@/components/ui'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Logo from '@/components/Logo.vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const route = useRoute()
const isReaderPage = computed(() => 
  route.path.startsWith('/manga/') && route.query.chapter !== undefined
)

const readerActions = [
  { icon: List, label: 'Chapters', action: 'chapters' },
  { icon: BookmarkPlus, label: 'Add Bookmark', action: 'bookmark' },
]

const navItems = [
  { icon: History, label: 'History', to: '/history' },
  { icon: Bookmark, label: 'Bookmarks', to: '/bookmarks' },
]

const emitReaderAction = (action: string) => {
  window.dispatchEvent(new CustomEvent('reader-action', { detail: action }))
}
</script>
