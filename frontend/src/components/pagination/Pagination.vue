<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Chapter {
  name: string
  path: string
}

interface Props {
  currentPage: number
  totalPages: number
  disabled?: boolean
  chapters?: Chapter[]
  currentChapterPath?: string
  hidePageSelector?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'changePage', page: number): void
  (e: 'changeChapter', chapterPath: string): void
}>()

const pageOptions = computed(() => {
  return Array.from({ length: props.totalPages }, (_, i) => ({
    value: String(i),
    label: `Page ${i + 1}`
  }))
})

const handlePageChange = (value: any) => {
  if (value !== null && value !== undefined) {
    const numValue = typeof value === 'string' ? parseInt(value) : typeof value === 'bigint' ? Number(value) : value
    emit('changePage', numValue)
  }
}

const handleChapterChange = (value: any) => {
  if (value !== null && value !== undefined) {
    emit('changeChapter', String(value))
  }
}
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
    <!-- Chapter Selector -->
    <div v-if="chapters && chapters.length > 0" class="flex items-center gap-2 min-w-[200px]">
      <span class="text-sm text-muted-foreground whitespace-nowrap">Chapter:</span>
      <Select :model-value="currentChapterPath" @update:model-value="handleChapterChange">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select chapter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="chapter in chapters"
            :key="chapter.path"
            :value="chapter.path"
          >
            {{ chapter.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Page Navigation -->
    <TooltipProvider>
      <div class="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              @click="emit('prev')"
              :disabled="(props.disabled || props.currentPage === 0) && !props.hidePageSelector"
            >
              <ChevronLeft class="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Previous</p>
          </TooltipContent>
        </Tooltip>
        
        <!-- Page Selector -->
        <Select v-if="totalPages > 0 && !hidePageSelector" :model-value="String(currentPage)" @update:model-value="handlePageChange">
          <SelectTrigger class="w-[130px]">
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in pageOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              @click="emit('next')"
              :disabled="props.disabled || props.currentPage === props.totalPages - 1"
            >
              <ChevronRight class="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Next</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  </div>
</template>
