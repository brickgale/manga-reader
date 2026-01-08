<template>
  <div class="min-h-screen bg-background">
    <nav class="border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Manga Reader</h1>
          <div class="flex gap-4">
            <router-link to="/" class="hover:text-primary">Home</router-link>
            <router-link to="/history" class="hover:text-primary">History</router-link>
            <router-link to="/bookmarks" class="hover:text-primary">Bookmarks</router-link>
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
</script>
