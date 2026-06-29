<script setup lang="ts">
import { onMounted } from 'vue'
import { useSessionStore } from '@/entities/session'
import { TimerRing } from '@/widgets/timer-ring'
import { TimerControls } from '@/features/timer-control'

const session = useSessionStore()

onMounted(() => {
  void session.loadSettings()
})
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-10 bg-background p-6 text-foreground">
    <TimerRing />
    <TimerControls />
  </main>
</template>
