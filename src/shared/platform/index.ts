import { Capacitor } from '@capacitor/core'
import type { IPlatform } from './types'
import { webPlatform } from './web'
import { tauriPlatform } from './tauri'
import { capacitorPlatform } from './capacitor'

/** Tauri 2 injects these globals into the webview. */
function isTauri(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
  )
}

/** Capacitor native shell (iOS/Android); false in a plain browser. */
function isCapacitor(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Resolve the active platform via runtime detection. The same web bundle runs
 * as web/PWA, Tauri (desktop) and Capacitor (mobile); each gets its adapter.
 */
function resolvePlatform(): IPlatform {
  if (isTauri()) return tauriPlatform
  if (isCapacitor()) return capacitorPlatform
  return webPlatform
}

export const platform: IPlatform = resolvePlatform()
export type { IPlatform } from './types'
