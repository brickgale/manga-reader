<script setup lang="ts">
import { Skeleton } from '@/components/ui'
import { Card } from '@/components/ui'
</script>

<template>
  <Card class="overflow-hidden">
    <div class="flex gap-0 min-h-[160px]">
      <!-- Cover Skeleton -->
      <div class="relative flex-shrink-0 w-24 sm:w-28 self-stretch">
        <Skeleton class="w-full h-full" />
      </div>

      <!-- Info Skeleton -->
      <div class="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div class="space-y-2">
          <div class="space-y-1">
            <Skeleton class="h-5 w-3/4" />
            <Skeleton class="h-3 w-1/2" />
          </div>

          <div class="space-y-1">
            <Skeleton class="h-3 w-2/3" />
            <Skeleton class="h-3 w-1/2" />
          </div>
        </div>

        <div class="mt-3 pt-3 border-t">
          <Skeleton class="h-3 w-1/3" />
        </div>
      </div>
    </div>
  </Card>
</template>
