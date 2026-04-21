<template>
  <header
    class="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="w-full px-4 lg:container lg:mx-auto h-full flex items-center">
      <div class="flex w-full items-center justify-between gap-4">
        <!-- Left: Sidebar Toggle (Mobile Only) -->
        <Button variant="ghost" size="icon" class="lg:hidden" @click="$emit('toggle-sidebar')">
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
              class="pl-9 pr-4 bg-muted/50"
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
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import { Menu, Search } from 'lucide-vue-next'
import { Button, Input } from '@/components/ui'
import { ThemeToggle } from '@/components/theme-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDark } from '@vueuse/core'

defineEmits<{
  'toggle-sidebar': []
}>()

const router = useRouter()
const route = useRoute()

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const searchQuery = ref('')

// Initialize search query from URL params (for /search page)
if (route.path === '/search' && route.query.q) {
  searchQuery.value = String(route.query.q)
}

// Watch for route changes to update search query
watch(
  () => [route.path, route.query.q] as const,
  ([path, queryQ]) => {
    if (path === '/search' && queryQ) {
      searchQuery.value = String(queryQ)
    } else {
      searchQuery.value = ''
    }
  }
)

// Debounced search - navigates to search page after 300ms of no typing
watchDebounced(
  searchQuery,
  newQuery => {
    const trimmedQuery = newQuery.trim()

    if (trimmedQuery) {
      // Navigate to search page with query
      router.push({ path: '/search', query: { q: trimmedQuery } })
    } else if (route.path === '/search') {
      // If on search page and query is empty, go back home
      router.push('/')
    }
  },
  { debounce: 300 }
)

const handleSearch = () => {
  const trimmedQuery = searchQuery.value.trim()

  // Navigate to search page with query on Enter key
  if (trimmedQuery) {
    router.push({ path: '/search', query: { q: trimmedQuery } })
  }
}
</script>
