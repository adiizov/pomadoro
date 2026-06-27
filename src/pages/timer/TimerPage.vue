<script setup lang="ts">
import { platform } from '@/shared/platform'
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
    <h1 class="text-3xl font-semibold tracking-tight">Pomodoro</h1>
    <p class="text-muted-foreground">FSD scaffold ready · platform: {{ platform.name }}</p>
    <span class="inline-flex items-center rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">
      coral primary
    </span>
  </main>
</template>
