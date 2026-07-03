<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Minimize2, Maximize2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/entities/session'
import { platform } from '@/shared/platform'
import { TimerRing } from '@/widgets/timer-ring'
import { TimerControls } from '@/features/timer-control'
import { ThemeSwitcher } from '@/features/theme-switch'

const session = useSessionStore()
const { t } = useI18n()

/** Desktop-only: mini-mode window control exists only on Tauri. */
const desktop = Boolean(platform.window)
const mini = ref(false)

async function toggleMini(): Promise<void> {
  mini.value = !mini.value
  await platform.window?.setMini(mini.value)
}

onMounted(() => {
  void session.loadSettings()
})
</script>

<template>
  <main class="relative flex min-h-screen flex-col items-center justify-center gap-10 bg-background p-6 text-foreground">
    <div class="absolute right-4 top-4 flex items-center gap-3">
      <ThemeSwitcher v-if="!mini" />
      <button
        v-if="desktop"
        type="button"
        class="grid size-8 place-items-center rounded-md border text-muted-foreground transition hover:bg-muted hover:text-foreground"
        :title="mini ? t('window.exit') : t('window.mini')"
        :aria-label="mini ? t('window.exit') : t('window.mini')"
        @click="toggleMini()"
      >
        <component :is="mini ? Maximize2 : Minimize2" class="size-4" />
      </button>
    </div>

    <TimerRing />
    <TimerControls v-if="!mini" />
  </main>
</template>
