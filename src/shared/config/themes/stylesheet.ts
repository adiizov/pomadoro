import { THEMES } from './themes'
import type { IThemeDefinition } from './types'

const STYLE_EL_ID = 'app-theme-tokens'

function themeToCss(theme: IThemeDefinition): string {
  const decls = Object.entries(theme.tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')
  return `:root[data-theme="${theme.id}"] {\n${decls}\n}`
}

/** Generate the `<style>` text with token overrides for every theme. */
export function buildThemeCss(themes: readonly IThemeDefinition[] = THEMES): string {
  return themes.map(themeToCss).join('\n\n')
}

/**
 * Inject the generated theme token stylesheet once (idempotent). Themes are
 * then switched by flipping the `data-theme` attribute — the cascade does the
 * rest, so no per-change JS re-injection is needed.
 */
export function injectThemeStyles(): void {
  if (typeof document === 'undefined') return
  let el = document.getElementById(STYLE_EL_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_EL_ID
    document.head.appendChild(el)
  }
  el.textContent = buildThemeCss()
}
