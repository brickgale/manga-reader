<template>
  <div
    role="status"
    aria-live="polite"
    class="flex items-center justify-center gap-1.5 py-8"
  >
    <div class="flex gap-1">
      <div
        v-for="i in 3"
        :key="i"
        class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
        :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
      />
    </div>
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
// Animated loading icon with three bouncing dots
</script>

<style scoped>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.75rem);
  }
}

.animate-bounce {
  animation: bounce 0.6s ease-in-out infinite;
}
</style>
