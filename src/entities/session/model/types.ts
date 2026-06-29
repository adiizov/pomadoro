/** Pomodoro session domain types & constants. UI strings live in i18n. */

export type TSessionMode = 'focus' | 'short' | 'long'

export const SESSION_MODES: TSessionMode[] = ['focus', 'short', 'long']

export interface ISessionSettings {
  /** durations in minutes */
  focus: number
  short: number
  long: number
  /** auto-start the next session when one ends */
  autoStart: boolean
  /** play the completion chime */
  sound: boolean
}

export interface ISetModeOptions {
  autoplay?: boolean
}

export const DEFAULT_SETTINGS: ISessionSettings = {
  focus: 25,
  short: 5,
  long: 15,
  autoStart: false,
  sound: true,
}

/** How many focus sessions before a long break. */
export const CYCLE_LENGTH = 4
