import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor (mobile) wraps the same Vite bundle in a native iOS/Android shell.
 * `webDir` points at the production build; platform differences are hidden
 * behind shared/platform (storage/notifications/haptics).
 */
const config: CapacitorConfig = {
  appId: 'com.pomodoro.app',
  appName: 'Pomodoro',
  webDir: 'dist',
}

export default config
