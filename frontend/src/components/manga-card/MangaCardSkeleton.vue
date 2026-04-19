<script setup lang="ts">
import { Skeleton } from '@/components/ui'
import { Card, CardHeader, CardContent } from '@/components/ui'
</script>

<template>
  <Card class="overflow-hidden">
    <Skeleton class="aspect-[3/4] w-full" />
    <CardHeader class="p-3 pb-0">
      <Skeleton class="h-4 w-3/4" />
    </CardHeader>
    <CardContent class="p-3 pt-1">
      <Skeleton class="h-3 w-1/2" />
    </CardContent>
  </Card>
</template>
