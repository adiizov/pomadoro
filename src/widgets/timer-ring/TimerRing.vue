<script setup lang="ts">
import { computed } from 'vue'
import { CYCLE_LENGTH, useSessionStore } from '@/entities/session'
import { formatTime } from '@/shared/lib/format'

const session = useSessionStore()

const RADIUS = 108
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const dashoffset = computed(() => CIRCUMFERENCE * (1 - session.progress))
const time = computed(() => formatTime(session.remaining))
</script>

<template>
  <div class="relative grid place-items-center">
    <svg width="240" height="240" viewBox="0 0 240 240" class="-rotate-90">
      <circle cx="120" cy="120" :r="RADIUS" fill="none" stroke="var(--muted)" stroke-width="12" />
      <circle
        cx="120"
        cy="120"
        :r="RADIUS"
        fill="none"
        stroke="var(--primary)"
        stroke-width="12"
        stroke-linecap="round"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashoffset"
        class="transition-[stroke-dashoffset] duration-300 ease-linear"
      />
    </svg>

    <div class="absolute flex flex-col items-center gap-2">
      <span class="text-5xl font-semibold tabular-nums tracking-tight">{{ time }}</span>
      <span class="text-sm text-muted-foreground">{{ session.phaseLabel }}</span>
      <div class="mt-1 flex gap-1.5">
        <span
          v-for="i in CYCLE_LENGTH"
          :key="i"
          class="size-2 rounded-full transition-colors"
          :class="i <= session.cycleProgress ? 'bg-primary' : 'bg-muted'"
        />
      </div>
    </div>
  </div>
</template>
