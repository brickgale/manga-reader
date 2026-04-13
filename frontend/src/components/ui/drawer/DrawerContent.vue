<script setup lang="ts">
import { inject, onMounted, onUnmounted } from 'vue'

interface Props {
  side?: 'left' | 'right' | 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  side: 'right',
})

const drawer = inject<{
  isOpen: { value: boolean }
  setOpen: (value: boolean) => void
}>('drawer')

const handleBackdropClick = () => {
  drawer?.setOpen(false)
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    drawer?.setOpen(false)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="drawer?.isOpen.value"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        @click="handleBackdropClick"
      />
    </Transition>

    <Transition
      :enter-active-class="`transition-transform duration-300 ease-out`"
      :enter-from-class="
        side === 'right'
          ? 'translate-x-full'
          : side === 'left'
            ? '-translate-x-full'
            : side === 'top'
              ? '-translate-y-full'
              : 'translate-y-full'
      "
      :enter-to-class="'translate-x-0 translate-y-0'"
      :leave-active-class="`transition-transform duration-300 ease-in`"
      :leave-from-class="'translate-x-0 translate-y-0'"
      :leave-to-class="
        side === 'right'
          ? 'translate-x-full'
          : side === 'left'
            ? '-translate-x-full'
            : side === 'top'
              ? '-translate-y-full'
              : 'translate-y-full'
      "
    >
      <div
        v-if="drawer?.isOpen.value"
        :class="[
          'fixed z-50 bg-background shadow-lg',
          side === 'right' && 'right-0 top-0 h-full w-3/4 max-w-sm border-l',
          side === 'left' && 'left-0 top-0 h-full w-3/4 max-w-sm border-r',
          side === 'top' && 'top-0 left-0 right-0 max-h-[85vh] border-b',
          side === 'bottom' && 'bottom-0 left-0 right-0 max-h-[85vh] border-t',
        ]"
        @click.stop
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
