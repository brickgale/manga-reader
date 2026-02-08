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
</script>
