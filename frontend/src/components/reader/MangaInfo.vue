<template>
  <div class="mb-6">
    <div class="flex gap-6">
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

        <div v-if="progress" class="p-4 bg-muted rounded-lg">
          <p class="text-sm mb-2">
            <strong>Last Read:</strong> Chapter {{ formatChapterName(progress.lastChapterPath) }},
            Page
            {{ progress.lastPageNumber + 1 }}
          </p>
          <p class="text-sm">
            <strong>Farthest:</strong> Chapter
            {{ formatChapterName(progress.farthestChapterPath) }}, Page
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
</script>
