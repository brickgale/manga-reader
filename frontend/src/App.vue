<template>
  <div class="min-h-screen bg-background text-foreground">
    <Toaster />
    <nav class="border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo :width="36" :height="36" />
            <span class="text-2xl font-bold hidden md:inline-block">Manga Reader</span>
          </router-link>
          <div class="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <router-link to="/history" class="hover:text-primary transition-colors">
                    <History class="h-5 w-5" />
                  </router-link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>History</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger as-child>
                  <router-link to="/bookmarks" class="hover:text-primary transition-colors">
                    <Bookmark class="h-5 w-5" />
                  </router-link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bookmarks</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { History, Bookmark } from 'lucide-vue-next'
import { Toaster } from '@/components/ui/sonner'
import ThemeToggle from './components/ThemeToggle.vue'
import Logo from './components/Logo.vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
</script>
