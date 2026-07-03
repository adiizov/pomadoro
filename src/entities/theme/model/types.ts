/** Appearance mode — the light/dark axis, orthogonal to the color theme. */
export type TThemeMode = 'light' | 'dark' | 'system'

export const THEME_MODES: TThemeMode[] = ['light', 'dark', 'system']

export function isThemeMode(value: unknown): value is TThemeMode {
  return typeof value === 'string' && (THEME_MODES as string[]).includes(value)
}
