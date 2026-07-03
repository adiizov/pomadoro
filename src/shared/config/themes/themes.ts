import type { IThemeDefinition, TThemeId } from './types'

/**
 * Base color themes. Each overrides the brand tokens (primary/ring) that drive
 * the timer ring, buttons and focus states; neutrals stay from src/style.css so
 * light/dark surfaces keep working. Add richer per-mode palettes later if needed.
 */
export const THEMES: readonly IThemeDefinition[] = [
  {
    id: 'coral',
    premium: false,
    tokens: {
      '--primary': 'oklch(0.72 0.15 30)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.72 0.15 30)',
    },
  },
  {
    id: 'ocean',
    premium: false,
    tokens: {
      '--primary': 'oklch(0.62 0.13 240)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.62 0.13 240)',
    },
  },
  {
    id: 'forest',
    premium: false,
    tokens: {
      '--primary': 'oklch(0.6 0.13 155)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.6 0.13 155)',
    },
  },
  {
    id: 'grape',
    premium: true,
    tokens: {
      '--primary': 'oklch(0.55 0.2 300)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--ring': 'oklch(0.55 0.2 300)',
    },
  },
]

export const DEFAULT_THEME_ID: TThemeId = 'coral'

export function isThemeId(value: unknown): value is TThemeId {
  return typeof value === 'string' && THEMES.some((t) => t.id === value)
}
