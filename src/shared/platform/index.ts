import type { IPlatform } from './types'
import { webPlatform } from './web'

/**
 * Resolve the active platform. For now only the web implementation exists;
 * Tauri/Capacitor implementations are added in their respective steps and
 * selected here via runtime detection (window.__TAURI__, Capacitor global).
 */
function resolvePlatform(): IPlatform {
  return webPlatform
}

export const platform: IPlatform = resolvePlatform()
export type { IPlatform } from './types'
