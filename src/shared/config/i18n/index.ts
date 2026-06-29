import { createI18n } from 'vue-i18n'
import { en } from './locales/en'
import { ru } from './locales/ru'

export type TLocale = 'en' | 'ru'

export const SUPPORTED_LOCALES: TLocale[] = ['en', 'ru']

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ru },
})

/** Translate outside of components (e.g. Pinia stores). */
export function translate(key: string, named?: Record<string, unknown>): string {
  return named ? i18n.global.t(key, named) : i18n.global.t(key)
}
