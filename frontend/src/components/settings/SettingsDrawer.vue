<script setup lang="ts">
import { ref, watch } from 'vue'
import { Drawer, DrawerContent, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui'
import { X } from 'lucide-vue-next'
import { api } from '@/api'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const libraryDirectory = ref<string>('')
const appVersion = ref<string>('...')

const fetchVersion = async () => {
  try {
    const { version } = await api.getVersion()
    appVersion.value = version
  } catch (error) {
    console.error('Failed to fetch version:', error)
    appVersion.value = '...'
  }
}

const fetchLibraryDirectory = async () => {
  try {
    const response = await api.getManga(1, 1)
    if (response.data.length > 0) {
      const firstMangaPath = response.data[0].path
      const parentDir = firstMangaPath.substring(0, firstMangaPath.lastIndexOf('/'))
      if (parentDir) {
        libraryDirectory.value = parentDir
      }
    }
  } catch (error) {
    console.error('Failed to fetch library directory:', error)
  }
}

watch(
  () => props.open,
  isOpen => {
    if (isOpen) {
      if (!libraryDirectory.value) {
        fetchLibraryDirectory()
      }
      if (appVersion.value === '...') {
        fetchVersion()
      }
    }
  }
)
</script>

<template>
  <Drawer :open="open" @update:open="emit('update:open', $event)">
    <DrawerContent side="right">
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex h-16 items-center justify-between border-b px-4">
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold leading-none tracking-tight">Settings</h2>
            <p class="text-sm text-muted-foreground mt-1">Customize your reading experience</p>
          </div>
          <DrawerClose as-child>
            <Button variant="ghost" size="icon" class="shrink-0">
              <X class="h-5 w-5" />
            </Button>
          </DrawerClose>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-6">
            <!-- Library Settings -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold">Library</h3>
              <div class="space-y-2">
                <div v-if="libraryDirectory" class="text-sm">
                  <span class="text-muted-foreground">Current directory:</span>
                  <div class="font-mono text-xs mt-1 p-2 bg-muted rounded">
                    {{ libraryDirectory }}
                  </div>
                </div>
                <p v-else class="text-sm text-muted-foreground">
                  No library directory set. Scan a directory to get started.
                </p>
              </div>
            </div>

            <!-- Reading Preferences -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold">Reading Preferences</h3>
              <div class="space-y-2">
                <p class="text-sm text-muted-foreground">
                  Reading mode preferences and other settings will be added here.
                </p>
              </div>
            </div>

            <!-- Display Settings -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold">Display</h3>
              <div class="space-y-2">
                <p class="text-sm text-muted-foreground">
                  Display and appearance settings will be added here.
                </p>
              </div>
            </div>

            <!-- About -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold">About</h3>
              <p class="text-sm text-muted-foreground">Manga Reader v{{ appVersion }}</p>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
