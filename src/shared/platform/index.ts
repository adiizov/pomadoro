import type { IPlatform } from './types'
import { webPlatform } from './web'
import { tauriPlatform } from './tauri'

/** Tauri 2 injects these globals into the webview. */
function isTauri(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
  )
}

/**
 * Resolve the active platform via runtime detection. Same web bundle runs as
 * web/PWA, Tauri (desktop) and Capacitor (mobile); each gets its adapter here.
 * Capacitor is added in step 5.
 */
function resolvePlatform(): IPlatform {
  if (isTauri()) return tauriPlatform
  return webPlatform
}

export const platform: IPlatform = resolvePlatform()
export type { IPlatform } from './types'
