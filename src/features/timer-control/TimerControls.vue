<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SESSION_MODES, useSessionStore } from '@/entities/session'

const session = useSessionStore()
const { t } = useI18n()
</script>

<template>
  <div class="flex w-full flex-col items-center gap-6">
    <!-- mode tabs -->
    <div class="inline-flex rounded-lg bg-muted p-1">
      <button
        v-for="m in SESSION_MODES"
        :key="m"
        class="rounded-md px-3 py-1.5 text-sm transition"
        :class="session.mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
        @click="session.setMode(m)"
      >
        {{ t(`session.mode.${m}`) }}
      </button>
    </div>

    <!-- primary toggle -->
    <button
      class="min-w-40 rounded-full bg-primary px-8 py-3 text-lg font-medium text-primary-foreground transition hover:opacity-90"
      @click="session.toggle()"
    >
      {{ session.toggleLabel }}
    </button>

    <!-- secondary actions -->
    <div class="flex gap-3">
      <button
        class="rounded-md border px-4 py-2 text-sm transition hover:bg-muted"
        @click="session.reset()"
      >
        {{ t('controls.reset') }}
      </button>
      <button
        class="rounded-md border px-4 py-2 text-sm transition hover:bg-muted"
        @click="session.skip()"
      >
        {{ t('controls.skip') }}
      </button>
    </div>
  </div>
</template>
