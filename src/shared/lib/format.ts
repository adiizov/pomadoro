/** Format a number of seconds as `mm:ss`. */
export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0')
  const s = (safe % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
