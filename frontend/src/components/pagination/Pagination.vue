<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight, ArrowDownUp } from 'lucide-vue-next'

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
  disablePrev?: boolean
  disableNext?: boolean
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
    label: `Page ${i + 1}`,
  }))
})

const handlePageChange = (value: any) => {
  if (value !== null && value !== undefined) {
    const numValue =
      typeof value === 'string'
        ? parseInt(value)
        : typeof value === 'bigint'
          ? Number(value)
          : value
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
  <div class="flex flex-row flex-wrap justify-center items-center gap-1 sm:gap-2">
    <!-- Chapter Selector - Desktop -->
    <div
      v-if="chapters && chapters.length > 0"
      class="hidden sm:flex items-center gap-2 min-w-[140px] sm:min-w-[180px]"
    >
      <Select :model-value="currentChapterPath" @update:model-value="handleChapterChange">
        <SelectTrigger class="w-full max-w-[180px] h-9">
          <SelectValue placeholder="Select chapter" />
        </SelectTrigger>
        <SelectContent class="w-[130px]">
          <SelectItem v-for="chapter in chapters" :key="chapter.path" :value="chapter.path">
            {{ chapter.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Page Navigation -->
    <TooltipProvider>
      <div class="flex items-center gap-1 sm:gap-2">
        <!-- Chapter Selector Button - Mobile Only -->
        <Tooltip v-if="chapters && chapters.length > 0">
          <TooltipTrigger as-child>
            <div class="sm:hidden">
              <Select :model-value="currentChapterPath" @update:model-value="handleChapterChange">
                <SelectTrigger
                  class="h-9 w-9 p-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground [&>span:first-child]:hidden [&>svg:last-child]:hidden flex items-center justify-center"
                >
                  <ArrowDownUp class="h-4 w-4" />
                </SelectTrigger>
                <SelectContent class="w-[130px]">
                  <SelectItem v-for="chapter in chapters" :key="chapter.path" :value="chapter.path">
                    {{ chapter.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select Chapter</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              class="h-9 w-9"
              @click="emit('prev')"
              :disabled="
                props.disablePrev ||
                ((props.disabled || props.currentPage === 0) && !props.hidePageSelector)
              "
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Previous</p>
          </TooltipContent>
        </Tooltip>

        <!-- Page Selector -->
        <Select
          v-if="totalPages > 0 && !hidePageSelector"
          :model-value="String(currentPage)"
          @update:model-value="handlePageChange"
        >
          <SelectTrigger class="w-full max-w-[90px] h-9 text-xs sm:text-sm">
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent class="w-[100px]">
            <SelectItem v-for="option in pageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              class="h-9 w-9"
              @click="emit('next')"
              :disabled="
                props.disableNext || props.disabled || props.currentPage === props.totalPages - 1
              "
            >
              <ChevronRight class="h-4 w-4" />
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
