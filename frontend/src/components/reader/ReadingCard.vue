<template>
  <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30">
    <div class="flex gap-0 min-h-[160px]">
      <!-- Cover Image -->
      <router-link
        v-if="linkable"
        :to="mangaRoute"
        class="relative flex-shrink-0 w-24 sm:w-28 self-stretch overflow-hidden"
      >
        <div class="absolute inset-0">
          <!-- Blurred background -->
          <img
            v-if="coverUrl"
            :src="coverUrl"
            alt=""
            class="absolute inset-0 w-full h-full object-cover blur-sm scale-150"
          />
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 z-10" />
          <!-- Main cover image -->
          <img
            v-if="coverUrl"
            :src="coverUrl"
            :alt="title"
            class="absolute inset-0 w-full h-full object-contain z-20 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105"
          />
          <div v-else class="absolute inset-0 bg-muted flex items-center justify-center z-20">
            <BookOpen class="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </router-link>
      <div v-else class="relative flex-shrink-0 w-24 sm:w-28 self-stretch overflow-hidden">
        <!-- Blurred background -->
        <img
          v-if="coverUrl"
          :src="coverUrl"
          alt=""
          class="absolute inset-0 w-full h-full object-cover blur-2xl scale-150 opacity-60"
        />
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 z-10" />
        <!-- Main cover image -->
        <img
          v-if="coverUrl"
          :src="coverUrl"
          :alt="title"
          class="absolute inset-0 w-full h-full object-contain z-20 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105"
        />
        <div v-else class="absolute inset-0 bg-muted flex items-center justify-center z-20">
          <BookOpen class="w-8 h-8 text-muted-foreground" />
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <component
          :is="linkable ? 'router-link' : 'div'"
          :to="linkable ? mangaRoute : undefined"
          class="flex flex-col space-y-2 flex-1"
        >
          <div>
            <h3
              class="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors"
              :title="title"
            >
              {{ title }}
            </h3>
            <p v-if="altTitle" class="text-xs text-muted-foreground truncate mt-0.5">
              {{ altTitle }}
            </p>
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen class="w-3.5 h-3.5" />
              <span class="font-medium">{{ chapterName }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText class="w-3.5 h-3.5" />
              <span>Page {{ pageNumber + 1 }}</span>
            </div>
          </div>
        </component>

        <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t">
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Clock class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="truncate">{{ formattedTime }}</span>
          </div>
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, FileText, Clock } from 'lucide-vue-next'
import { Card } from '@/components/ui'

interface Props {
  mangaId: string
  chapterPath: string
  pageNumber: number
  title: string
  altTitle?: string | null
  coverUrl?: string
  chapterName: string
  formattedTime: string
  linkable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  linkable: true,
})

const mangaRoute = computed(() => ({
  path: `/manga/${props.mangaId}`,
  query: { chapter: props.chapterPath, page: props.pageNumber.toString() },
}))
</script>
