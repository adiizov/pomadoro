import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { i18n } from '@/shared/config/i18n'
import { injectThemeStyles } from '@/shared/config/themes'
import '@/style.css'

export function bootstrap() {
  injectThemeStyles()
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(i18n)
  app.mount('#app')
  return app
}
