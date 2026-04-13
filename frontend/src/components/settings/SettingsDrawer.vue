<script setup lang="ts">
import { Drawer, DrawerContent, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui'
import { X } from 'lucide-vue-next'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
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
              <p class="text-sm text-muted-foreground">Manga Reader v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
