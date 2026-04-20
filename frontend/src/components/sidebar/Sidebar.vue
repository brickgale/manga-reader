<script setup lang="ts">
import { Library, Scroll, Bookmark, Settings } from 'lucide-vue-next'
import { Logo } from '@/components/logo'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  'toggle-settings': []
}>()

const navItems = [
  { icon: Library, label: 'Library', to: '/' },
  { icon: Scroll, label: 'History', to: '/history' },
  { icon: Bookmark, label: 'Bookmarks', to: '/bookmarks' },
]

const handleNavClick = () => {
  // Only close sidebar on mobile (< 1024px)
  if (window.innerWidth < 1024) {
    emit('close')
  }
}

const handleNavigate = (navigateFn: () => void) => {
  navigateFn()
  handleNavClick()
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
      class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed left-0 top-0 z-50 h-full w-64 border-r bg-background transition-transform duration-300',
      'lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <div class="flex h-full flex-col">
      <!-- Header -->
      <div class="flex h-14 items-center justify-center border-b px-4">
        <router-link to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo :width="32" :height="32" />
          <span class="text-lg">Manga <span class="text-primary">Reader</span></span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="space-y-1 p-4">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ navigate, isExactActive }"
        >
          <a
            :class="[
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
              isExactActive
                ? 'bg-primary/10 text-primary border-r-4 border-primary'
                : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
            ]"
            @click="handleNavigate(navigate)"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </a>
        </router-link>
      </nav>

      <!-- Settings Button -->
      <div class="p-4 pt-0 mt-auto space-y-1">
        <button
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-primary/10 hover:text-primary w-full"
          @click="emit('toggle-settings')"
        >
          <Settings class="h-5 w-5" />
          Settings
        </button>
      </div>
    </div>
  </aside>
</template>
