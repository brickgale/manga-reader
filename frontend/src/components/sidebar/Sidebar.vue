<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Home, History, Bookmark } from 'lucide-vue-next'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

const navItems = [
  { icon: Home, label: 'Library', to: '/' },
  { icon: History, label: 'History', to: '/history' },
  { icon: Bookmark, label: 'Bookmarks', to: '/bookmarks' },
]

const isActive = (path: string) => {
  return route.path === path
}

const handleNavClick = () => {
  // Only close sidebar on mobile (< 768px)
  if (window.innerWidth < 768) {
    emit('close')
  }
}
</script>

<template>
  <!-- Mobile overlay -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Sidebar -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <aside
      v-if="isOpen"
      class="fixed left-0 top-0 z-50 h-full w-64 border-r bg-background md:sticky md:top-0 md:block md:h-screen"
    >
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex h-16 items-center border-b px-4">
          <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo :width="36" :height="36" />
            <span class="text-xl font-bold">Manga Reader</span>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 p-4">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
            ]"
            @click="handleNavClick"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </router-link>
        </nav>
      </div>
    </aside>
  </Transition>
</template>
