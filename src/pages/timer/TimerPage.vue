<script setup lang="ts">
import { onMounted } from 'vue'
import { useSessionStore } from '@/entities/session'
import { TimerRing } from '@/widgets/timer-ring'
import { TimerControls } from '@/features/timer-control'
import { ThemeSwitcher } from '@/features/theme-switch'

const session = useSessionStore()

onMounted(() => {
  void session.loadSettings()
})
</script>

<template>
  <main class="relative flex min-h-screen flex-col items-center justify-center gap-10 bg-background p-6 text-foreground">
    <div class="absolute right-4 top-4">
      <ThemeSwitcher />
    </div>
    <TimerRing />
    <TimerControls />
  </main>
</template>
