import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { platform } from '@/shared/platform'
import { chime } from '@/shared/lib/chime'
import { translate } from '@/shared/config/i18n'
import {
  CYCLE_LENGTH,
  DEFAULT_SETTINGS,
  type ISessionSettings,
  type ISetModeOptions,
  type TSessionMode,
} from './types'

const SETTINGS_KEY = 'pomodoro:settings'

export const useSessionStore = defineStore('session', () => {
  const settings = ref<ISessionSettings>({ ...DEFAULT_SETTINGS })
  const mode = ref<TSessionMode>('focus')
  const total = ref(settings.value.focus * 60)
  const remaining = ref(total.value)
  const running = ref(false)
  /** completed focus sessions, drives the 4-step cycle */
  const completedFocus = ref(0)

  let ticker: ReturnType<typeof setInterval> | null = null

  // ---- derived ----
  const progress = computed(() => (total.value > 0 ? remaining.value / total.value : 0))
  const phaseLabel = computed(() => translate(`session.phase.${mode.value}`))
  /** filled dots in the current 4-focus cycle (all four during the long break) */
  const cycleProgress = computed(() =>
    mode.value === 'long' ? CYCLE_LENGTH : completedFocus.value % CYCLE_LENGTH,
  )
  const toggleLabel = computed(() => {
    if (running.value) return translate('controls.pause')
    return remaining.value === total.value ? translate('controls.start') : translate('controls.resume')
  })

  function minutesFor(m: TSessionMode): number {
    return m === 'focus' ? settings.value.focus : m === 'short' ? settings.value.short : settings.value.long
  }

  // ---- engine ----
  function clearTicker(): void {
    if (ticker) {
      clearInterval(ticker)
      ticker = null
    }
  }

  function tick(): void {
    remaining.value -= 1
    if (remaining.value <= 0) {
      remaining.value = 0
      finishSession()
    }
  }

  function start(): void {
    if (running.value || remaining.value <= 0) return
    running.value = true
    ticker = setInterval(tick, 1000)
    void platform.notifications.ensurePermission()
  }

  function stop(): void {
    running.value = false
    clearTicker()
  }

  function toggle(): void {
    running.value ? stop() : start()
  }

  function reset(): void {
    stop()
    remaining.value = total.value
  }

  function setMode(next: TSessionMode, { autoplay = false }: ISetModeOptions = {}): void {
    stop()
    mode.value = next
    total.value = minutesFor(next) * 60
    remaining.value = total.value
    if (autoplay) start()
  }

  /** End the current session as if completed and advance the cycle. */
  function finishSession(): void {
    stop()
    if (settings.value.sound) chime()
    void platform.notifications.notify(translate('session.title'), translate(`session.done.${mode.value}`))

    let next: TSessionMode
    if (mode.value === 'focus') {
      completedFocus.value += 1
      next = completedFocus.value % CYCLE_LENGTH === 0 ? 'long' : 'short'
    } else {
      next = 'focus'
    }
    setMode(next, { autoplay: settings.value.autoStart })
  }

  /** Skip = treat current session as completed. */
  function skip(): void {
    finishSession()
  }

  // ---- persistence ----
  async function loadSettings(): Promise<void> {
    const saved = await platform.storage.get<Partial<ISessionSettings>>(SETTINGS_KEY)
    if (saved) settings.value = { ...DEFAULT_SETTINGS, ...saved }
    if (!running.value) setMode(mode.value)
  }

  async function updateSettings(patch: Partial<ISessionSettings>): Promise<void> {
    settings.value = { ...settings.value, ...patch }
    await platform.storage.set(SETTINGS_KEY, settings.value)
    if (!running.value) {
      total.value = minutesFor(mode.value) * 60
      remaining.value = total.value
    }
  }

  return {
    settings,
    mode,
    total,
    remaining,
    running,
    completedFocus,
    progress,
    phaseLabel,
    cycleProgress,
    toggleLabel,
    setMode,
    start,
    stop,
    toggle,
    reset,
    skip,
    finishSession,
    loadSettings,
    updateSettings,
  }
})
