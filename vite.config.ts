import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Tauri (desktop) drives the dev server; these settings keep Vite friendly to
// it while staying no-ops for plain web/PWA builds. See https://tauri.app.
const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Tauri expects a fixed port and fails if it is not available.
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 5174 } : undefined,
    watch: {
      // don't watch the Rust side
      ignored: ['**/src-tauri/**'],
    },
  },
  // Expose TAURI_ENV_* to the client so platform detection can branch at build.
  envPrefix: ['VITE_', 'TAURI_ENV_'],
})
