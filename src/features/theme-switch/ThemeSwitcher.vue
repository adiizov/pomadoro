<script setup lang="ts">
import { Sun, Moon, Monitor, Lock } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { THEME_MODES, useThemeStore, type TThemeMode } from '@/entities/theme'
import { THEMES } from '@/shared/config/themes'

const theme = useThemeStore()
const { t } = useI18n()

const MODE_ICONS: Record<TThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- color themes -->
    <div class="flex items-center gap-2">
      <button
        v-for="th in THEMES"
        :key="th.id"
        type="button"
        class="relative size-6 rounded-full ring-offset-2 ring-offset-background transition"
        :class="theme.themeId === th.id ? 'ring-2 ring-ring' : 'ring-1 ring-border hover:scale-110'"
        :style="{ backgroundColor: th.tokens['--primary'] }"
        :title="t(`theme.names.${th.id}`)"
        :aria-label="t(`theme.names.${th.id}`)"
        @click="theme.setTheme(th.id)"
      >
        <Lock v-if="th.premium" class="absolute inset-0 m-auto size-3 text-white drop-shadow" />
      </button>
    </div>

    <!-- appearance mode -->
    <div class="inline-flex rounded-lg bg-muted p-1">
      <button
        v-for="m in THEME_MODES"
        :key="m"
        type="button"
        class="grid size-7 place-items-center rounded-md transition"
        :class="theme.mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
        :title="t(`theme.mode.${m}`)"
        :aria-label="t(`theme.mode.${m}`)"
        @click="theme.setMode(m)"
      >
        <component :is="MODE_ICONS[m]" class="size-4" />
      </button>
    </div>
  </div>
</template>
