import { invoke } from '@tauri-apps/api/core'
import { load, type Store } from '@tauri-apps/plugin-store'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import type {
  INotificationsAdapter,
  IPlatform,
  IStorageAdapter,
  IWindowAdapter,
} from '../types'

const STORE_FILE = 'pomodoro.json'
let storePromise: Promise<Store> | null = null

function getStore(): Promise<Store> {
  if (!storePromise) storePromise = load(STORE_FILE, { defaults: {}, autoSave: true })
  return storePromise
}

const storage: IStorageAdapter = {
  async get<T>(key: string): Promise<T | null> {
    const store = await getStore()
    const value = await store.get<T>(key)
    return value ?? null
  },
  async set<T>(key: string, value: T): Promise<void> {
    const store = await getStore()
    await store.set(key, value)
    await store.save()
  },
  async remove(key: string): Promise<void> {
    const store = await getStore()
    await store.delete(key)
    await store.save()
  },
}

const notifications: INotificationsAdapter = {
  async ensurePermission(): Promise<boolean> {
    if (await isPermissionGranted()) return true
    return (await requestPermission()) === 'granted'
  },
  async notify(title: string, body?: string): Promise<void> {
    if (await this.ensurePermission()) sendNotification({ title, body })
  },
}

const windowAdapter: IWindowAdapter = {
  async setMini(mini: boolean): Promise<void> {
    await invoke('set_mini', { mini })
  },
}

export const tauriPlatform: IPlatform = {
  name: 'tauri',
  storage,
  notifications,
  window: windowAdapter,
}
