/**
 * Theme token model. A theme is a set of CSS-variable overrides applied on
 * `:root[data-theme=<id>]` — the same variables shadcn-vue and our Tailwind
 * utilities read, so switching a theme reskins the whole app. Light/dark is a
 * separate axis handled by the `.dark` class (see entities/theme).
 */

export type TThemeId = 'coral' | 'ocean' | 'forest' | 'grape'

export interface IThemeDefinition {
  id: TThemeId
  /** Premium themes are gated by subscription (gating lands in step 8). */
  premium: boolean
  /** CSS variable overrides, applied in both light and dark modes. */
  tokens: Record<string, string>
}
