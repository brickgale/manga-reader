<template>
  <div class="flex min-h-screen bg-background text-foreground">
    <Toaster />

    <!-- Left Sidebar -->
    <Sidebar
      :is-open="sidebarOpen"
      @close="sidebarOpen = false"
      @toggle-settings="settingsOpen = !settingsOpen"
    />

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col">
      <!-- Top Header -->
      <MainHeader v-if="!isReaderView" @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Page Content -->
      <main :class="isReaderView ? 'flex-1' : 'container mx-auto flex-1 p-4 overflow-visible'">
        <router-view v-slot="{ Component }">
          <component :is="Component" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
        </router-view>
      </main>
    </div>

    <!-- Right Settings Drawer -->
    <SettingsDrawer v-model:open="settingsOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import { MainHeader } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { SettingsDrawer } from '@/components/settings'

const route = useRoute()

// Hide header and sidebar in reader view (only when actively reading a chapter)
const isReaderView = computed(
  () => route.path.startsWith('/manga/') && route.params.id && route.query.chapter
)

// Initialize sidebar open state based on viewport width
const sidebarOpen = ref(typeof window !== 'undefined' && window.innerWidth >= 1024)
const settingsOpen = ref(false)

// Open sidebar by default on desktop
onMounted(() => {
  // Ensure sidebar is open on desktop in case of edge cases
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = true
  }

  // Add resize listener to always show sidebar on desktop
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  // Always show sidebar on desktop
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = true
  }
}

// Prevent layout shift when modal/select opens by preserving scrollbar space
const observer = new MutationObserver(() => {
  const hasOverflowHidden = document.body.style.overflow === 'hidden'
  if (hasOverflowHidden) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '0'
  } else {
    document.body.style.paddingRight = ''
  }
})

observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
</script>
