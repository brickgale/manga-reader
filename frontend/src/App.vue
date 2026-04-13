<template>
  <div class="flex min-h-screen bg-background text-foreground">
    <Toaster />

    <!-- Left Sidebar -->
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col">
      <!-- Top Header -->
      <MainHeader
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
        @toggle-settings="settingsOpen = !settingsOpen"
      />

      <!-- Page Content -->
      <main class="container mx-auto flex-1 px-4 py-8 overflow-visible">
        <router-view />
      </main>
    </div>

    <!-- Right Settings Drawer -->
    <SettingsDrawer v-model:open="settingsOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import MainHeader from '@/components/header/MainHeader.vue'
import { Sidebar } from '@/components/sidebar'
import { SettingsDrawer } from '@/components/settings'

const sidebarOpen = ref(false)
const settingsOpen = ref(false)

// Open sidebar by default on desktop
onMounted(() => {
  if (window.innerWidth >= 768) {
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
  if (window.innerWidth >= 768) {
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
