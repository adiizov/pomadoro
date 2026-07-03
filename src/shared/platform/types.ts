/**
 * Platform abstraction. The same Vue app runs as web/PWA, Tauri (desktop) and
 * Capacitor (mobile). Features depend ONLY on these interfaces; each target
 * provides a concrete implementation (see ./web, ./tauri, ./capacitor).
 */

export type TPlatformName = 'web' | 'tauri' | 'capacitor'

export interface IStorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
}

export interface INotificationsAdapter {
  /** Ask for permission if the platform requires it. Returns granted. */
  ensurePermission(): Promise<boolean>
  notify(title: string, body?: string): Promise<void>
}

/** Desktop-only window controls (tray/mini-mode). Absent on web & mobile. */
export interface IWindowAdapter {
  /** Toggle compact, always-on-top mini-mode. */
  setMini(mini: boolean): Promise<void>
}

export interface IPlatform {
  readonly name: TPlatformName
  readonly storage: IStorageAdapter
  readonly notifications: INotificationsAdapter
  /** Only present where a native window exists (Tauri desktop). */
  readonly window?: IWindowAdapter
}
