// Fixed demo clock and time formatting. Business logic never reads the real clock.

export const OPS_TIME_ZONE = 'America/New_York'

/** The demo day falls in EDT (UTC-4); DST ends on Nov 1, 2026. */
const DEMO_DATE = '2026-10-26'
const ET_OFFSET = '-04:00'
const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60

const etFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: OPS_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

/** ISO timestamp for a wall-clock time on the demo day, e.g. etTime('11:42'). */
export function etTime(hhmm: string): string {
  return `${DEMO_DATE}T${hhmm}:00${ET_OFFSET}`
}

/** "Now" for the whole app: 12:00 PM ET on the demo day. */
export const NOW: string = etTime('12:00')

function toMs(iso: string): number {
  return Date.parse(iso)
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(toMs(iso) + minutes * MS_PER_MINUTE).toISOString()
}

/** Whole minutes from `from` to `to` (negative when `to` is earlier). */
export function minutesBetween(from: string, to: string): number {
  return Math.round((toMs(to) - toMs(from)) / MS_PER_MINUTE)
}

/** Whole minutes until `iso` from `now` (negative when it's in the past). */
export function minutesUntil(iso: string, now: string = NOW): number {
  return minutesBetween(now, iso)
}

export function compareTimes(a: string, b: string): number {
  return toMs(a) - toMs(b)
}

function getClockParts(iso: string): { clock: string; period: string } {
  const parts = etFormatter.formatToParts(new Date(toMs(iso)))
  const hour = parts.find((part) => part.type === 'hour')?.value ?? ''
  const minute = parts.find((part) => part.type === 'minute')?.value ?? ''
  const period = parts.find((part) => part.type === 'dayPeriod')?.value ?? ''
  return { clock: `${hour}:${minute}`, period }
}

/** "11:42 AM ET". Pass `{ zone: false }` to drop the " ET" suffix. */
export function formatEt(iso: string, { zone = true }: { zone?: boolean } = {}): string {
  const { clock, period } = getClockParts(iso)
  return `${clock} ${period}${zone ? ' ET' : ''}`
}

/** "11:30 AM – 12:30 PM ET", or "12:00 – 1:00 PM ET" when both share AM/PM. */
export function formatEtWindow(start: string, end: string): string {
  const from = getClockParts(start)
  const to = getClockParts(end)
  const startText = from.period === to.period ? from.clock : `${from.clock} ${from.period}`
  return `${startText} – ${to.clock} ${to.period} ET`
}

/** "45 min", "1 hr", "1 hr 5 min". */
export function formatDuration(minutes: number): string {
  const total = Math.abs(minutes)
  if (total < MINUTES_PER_HOUR) return `${total} min`
  const hours = Math.floor(total / MINUTES_PER_HOUR)
  const rest = total % MINUTES_PER_HOUR
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
}

/** "18 min ago", "just now" or "in 12 min". */
export function formatRelative(iso: string, now: string = NOW): string {
  const minutes = minutesUntil(iso, now)
  if (minutes === 0) return 'just now'
  if (minutes < 0) return `${formatDuration(minutes)} ago`
  return `in ${formatDuration(minutes)}`
}

/** "closes in 30 min", "closes now" or "closed 5 min ago". */
export function formatClosesIn(iso: string, now: string = NOW): string {
  const minutes = minutesUntil(iso, now)
  if (minutes === 0) return 'closes now'
  if (minutes < 0) return `closed ${formatDuration(minutes)} ago`
  return `closes in ${formatDuration(minutes)}`
}
