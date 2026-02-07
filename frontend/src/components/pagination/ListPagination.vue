<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrev: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update-page', page: number): void
  (e: 'update-page-size', size: number): void
}>()

const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < props.totalPages) {
    if (end < props.totalPages - 1) pages.push('...')
    pages.push(props.totalPages)
  }

  return pages
})

const startItem = computed(() => props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1)
const endItem = computed(() => props.totalItems === 0 ? 0 : Math.min(props.currentPage * props.pageSize, props.totalItems))
</script>

<template>
  <div v-if="totalItems > 0" class="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
    <!-- Info Text -->
    <div class="text-sm text-muted-foreground">
      Showing <span class="font-semibold">{{ startItem }}</span>
      to <span class="font-semibold">{{ endItem }}</span>
      of <span class="font-semibold">{{ totalItems }}</span>
      items
    </div>
    
    <!-- Page Navigation -->
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        @click="emit('update-page', currentPage - 1)"
        :disabled="!hasPrev"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1">
        <Button
          v-for="page in pageNumbers"
          :key="page"
          @click="typeof page === 'number' && emit('update-page', page)"
          :variant="currentPage === page ? 'default' : 'outline'"
          :disabled="page === '...'"
          class="h-9 w-9 p-0"
        >
          {{ page }}
        </Button>
      </div>

      <Button
        variant="outline"
        size="icon"
        @click="emit('update-page', currentPage + 1)"
        :disabled="!hasNext"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
