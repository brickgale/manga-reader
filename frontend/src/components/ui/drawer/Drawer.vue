<script setup lang="ts">
import { ref, provide, watch } from 'vue'

interface Props {
  open?: boolean
  modal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  modal: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open ?? false)

watch(
  () => props.open,
  value => {
    if (value !== undefined) {
      isOpen.value = value
    }
  }
)

const setOpen = (value: boolean) => {
  isOpen.value = value
  emit('update:open', value)
}

provide('drawer', { isOpen, setOpen })
</script>

<template>
  <slot />
</template>
