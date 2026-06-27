import type { INotificationsAdapter, IPlatform, IStorageAdapter } from '../types'

const storage: IStorageAdapter = {
  async get<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  },
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  },
}

const notifications: INotificationsAdapter = {
  async ensurePermission(): Promise<boolean> {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    return (await Notification.requestPermission()) === 'granted'
  },
  async notify(title: string, body?: string): Promise<void> {
    if (await this.ensurePermission()) new Notification(title, { body })
  },
}

export const webPlatform: IPlatform = {
  name: 'web',
  storage,
  notifications,
}
