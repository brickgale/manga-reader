<template>
  <div class="mb-6">
    <div v-if="progress" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Left Half: Cover, Titles, Progress Bar -->
      <div class="flex gap-4">
        <!-- Cover Image -->
        <div class="flex-shrink-0">
          <img
            v-if="coverImageUrl"
            :src="coverImageUrl"
            :alt="manga.title"
            class="w-32 h-48 object-cover rounded-sm shadow-md"
          />
          <div v-else class="w-32 h-48 bg-muted rounded-sm flex items-center justify-center">
            <span class="text-muted-foreground text-sm">No Cover</span>
          </div>
        </div>

        <!-- Titles and Progress -->
        <div class="flex-1 min-w-0 flex flex-col">
          <h2 class="text-2xl font-bold mb-1 truncate">{{ manga.title }}</h2>
          <p v-if="manga.altTitle" class="text-sm text-muted-foreground mb-4 truncate">
            {{ manga.altTitle }}
          </p>

          <!-- Overall Progress Bar -->
          <div>
            <div class="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Overall Progress</span>
              <span>{{ formattedProgress }}</span>
            </div>
            <div class="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-300 ease-out"
                :style="{ width: `${progress.overallProgress ?? 0}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Half: Last Read Info -->
      <div class="p-4 bg-muted rounded-sm flex flex-col items-center justify-center">
        <p class="text-sm mb-2">
          <strong>Last Read:</strong> Chapter {{ formatChapterName(progress.lastChapterPath) }},
          Page
          {{ progress.lastPageNumber + 1 }}
        </p>
        <p class="text-sm">
          <strong>Farthest:</strong> Chapter {{ formatChapterName(progress.farthestChapterPath) }},
          Page
          {{ progress.farthestPageNumber + 1 }}
        </p>
        <button
          @click="$emit('resume')"
          class="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Resume Reading
        </button>
      </div>
    </div>

    <!-- Fallback when no progress -->
    <div v-else class="flex gap-6">
      <!-- Cover Image -->
      <div class="flex-shrink-0">
        <img
          v-if="coverImageUrl"
          :src="coverImageUrl"
          :alt="manga.title"
          class="w-32 h-48 object-cover rounded-lg shadow-md"
        />
        <div v-else class="w-32 h-48 bg-muted rounded-lg flex items-center justify-center">
          <span class="text-muted-foreground text-sm">No Cover</span>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold mb-1 truncate">{{ manga.title }}</h2>
        <p v-if="manga.altTitle" class="text-sm text-muted-foreground mb-4 truncate">
          {{ manga.altTitle }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type Manga, type ReadingProgress } from '@/api'
import { useMangaUtils } from '@/composables/useMangaUtils'

const props = defineProps<{
  manga: Manga
  progress: ReadingProgress | null
}>()

defineEmits<{
  resume: []
}>()

const { getCoverUrl, formatChapterName } = useMangaUtils()

const coverImageUrl = computed(() => getCoverUrl(props.manga))

const formattedProgress = computed(() => {
  if (!props.progress) return '0%'
  const progress = props.progress.overallProgress ?? 0
  return progress === 0 ? '0%' : `${progress.toFixed(1)}%`
})
</script>
