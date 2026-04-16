<template>
  <header
    class="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4 h-full flex items-center">
      <div class="flex w-full items-center justify-between gap-4">
        <!-- Left: Sidebar Toggle (Mobile Only) -->
        <Button variant="ghost" size="icon" class="md:hidden" @click="$emit('toggle-sidebar')">
          <Menu class="h-5 w-5" />
        </Button>

        <!-- Center: Search Bar -->
        <div class="flex-1 max-w-md md:max-w-lg">
          <div class="relative group">
            <Search
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary group-focus-within:text-primary"
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

        <!-- Right: Theme Toggle -->
        <div class="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <ThemeToggle />
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ isDark ? 'Dark Mode' : 'Light Mode' }}</p>
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
import { Menu, Search } from 'lucide-vue-next'
import { Button, Input } from '@/components/ui'
import { ThemeToggle } from '@/components/theme-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDark } from '@vueuse/core'

defineEmits<{
  'toggle-sidebar': []
}>()

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery.value)
  }
}
</script>
