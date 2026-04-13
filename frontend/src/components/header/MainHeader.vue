<template>
  <header
    class="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4 h-full flex items-center">
      <div class="flex w-full items-center justify-between gap-4">
        <!-- Left: Sidebar Toggle (Mobile Only) -->
        <Button variant="ghost" size="icon" class="md:hidden" @click="$emit('toggle-sidebar')">
          <Menu class="h-5 w-5" />
        </Button>

        <!-- Center: Search Bar -->
        <div class="flex-1 max-w-md md:max-w-lg">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              type="search"
              placeholder="Search manga..."
              class="pl-9 pr-4"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>

        <!-- Right: Theme Toggle & Settings Toggle -->
        <div class="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <ThemeToggle />
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Theme</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="ghost" size="icon" @click="$emit('toggle-settings')">
                  <Settings class="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, Search, Settings } from 'lucide-vue-next'
import { Button, Input } from '@/components/ui'
import { ThemeToggle } from '@/components/theme-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

defineEmits<{
  'toggle-sidebar': []
  'toggle-settings': []
}>()

const router = useRouter()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery.value)
  }
}
</script>
