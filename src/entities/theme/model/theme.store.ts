import { computed, ref, watchEffect } from 'vue'
import { defineStore } from 'pinia'
import { platform } from '@/shared/platform'
import { DEFAULT_THEME_ID, THEMES, isThemeId, type TThemeId } from '@/shared/config/themes'
import { isThemeMode, type TThemeMode } from './types'

const THEME_KEY = 'pomodoro:theme'

interface IPersistedTheme {
  themeId: TThemeId
  mode: TThemeMode
}

export const useThemeStore = defineStore('theme', () => {
  const themeId = ref<TThemeId>(DEFAULT_THEME_ID)
  const mode = ref<TThemeMode>('system')

  const media =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null
  const systemDark = ref(media?.matches ?? false)
  media?.addEventListener('change', (e) => {
    systemDark.value = e.matches
  })

  const isDark = computed(
    () => mode.value === 'dark' || (mode.value === 'system' && systemDark.value),
  )
  const current = computed(() => THEMES.find((t) => t.id === themeId.value) ?? THEMES[0])

  /** Reflect the resolved appearance onto <html>. Reruns on any dep change. */
  watchEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.setAttribute('data-theme', themeId.value)
    root.classList.toggle('dark', isDark.value)
  })

  async function persist(): Promise<void> {
    await platform.storage.set<IPersistedTheme>(THEME_KEY, {
      themeId: themeId.value,
      mode: mode.value,
    })
  }

  function setTheme(id: TThemeId): void {
    themeId.value = id
    void persist()
  }

  function setMode(next: TThemeMode): void {
    mode.value = next
    void persist()
  }

  async function load(): Promise<void> {
    const saved = await platform.storage.get<IPersistedTheme>(THEME_KEY)
    if (saved) {
      if (isThemeId(saved.themeId)) themeId.value = saved.themeId
      if (isThemeMode(saved.mode)) mode.value = saved.mode
    }
  }

  return { themeId, mode, isDark, current, setTheme, setMode, load }
})
