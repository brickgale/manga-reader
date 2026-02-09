<template>
  <div class="min-h-screen bg-background text-foreground">
    <Toaster />
    <MainHeader />
    <main class="container mx-auto px-4 py-8 overflow-visible">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import MainHeader from '@/components/header/MainHeader.vue'

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
