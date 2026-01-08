<template>
  <div class="min-h-screen bg-background text-foreground">
    <nav class="border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-2xl font-bold hover:text-primary transition-colors">
            Manga Reader
          </router-link>
          <div class="flex items-center gap-4">
            <router-link to="/history" class="hover:text-primary transition-colors">History</router-link>
            <router-link to="/bookmarks" class="hover:text-primary transition-colors">Bookmarks</router-link>
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
import ThemeToggle from './components/ThemeToggle.vue'
</script>
