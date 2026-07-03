import { Preferences } from '@capacitor/preferences'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import type {
  IHapticsAdapter,
  INotificationsAdapter,
  IPlatform,
  IStorageAdapter,
} from '../types'

const storage: IStorageAdapter = {
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key })
    if (value == null) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) })
  },
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key })
  },
}

/** Local notification ids must be numbers; roll a small counter. */
let notificationId = 1

const notifications: INotificationsAdapter = {
  async ensurePermission(): Promise<boolean> {
    const current = await LocalNotifications.checkPermissions()
    if (current.display === 'granted') return true
    const requested = await LocalNotifications.requestPermissions()
    return requested.display === 'granted'
  },
  async notify(title: string, body?: string): Promise<void> {
    if (!(await this.ensurePermission())) return
    await LocalNotifications.schedule({
      notifications: [{ id: notificationId++, title, body: body ?? '' }],
    })
  },
}

const haptics: IHapticsAdapter = {
  async impact(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Medium })
  },
}

export const capacitorPlatform: IPlatform = {
  name: 'capacitor',
  storage,
  notifications,
  haptics,
}
