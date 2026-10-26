// Route and stop rules: pending stops, progress, lateness.
import { compareTimes, minutesBetween } from './time'
import type { Route, Stop } from './types'

export interface StopProgress {
  delivered: number
  pending: number
  total: number
}

/** Pending stops in route order. */
export function getPendingStops(route: Route): Stop[] {
  return route.stops
    .filter((stop) => stop.status === 'pending')
    .sort((a, b) => a.number - b.number)
}

/** Counts pending stops from stop detail, or uses the board's count for short-context routes. */
export function getPendingStopCount(route: Route): number {
  if (route.stops.length > 0) return getPendingStops(route).length
  return route.reportedPendingStops ?? 0
}

export function getStopProgress(route: Route): StopProgress {
  const delivered = route.stops.filter((stop) => stop.status === 'delivered').length
  return { delivered, pending: getPendingStops(route).length, total: route.stops.length }
}

/** Minutes the ETA lands after the window closes; 0 when on time or without an ETA. */
export function getLateMinutes(stop: Stop): number {
  if (!stop.eta) return 0
  return Math.max(0, minutesBetween(stop.windowEnd, stop.eta))
}

/** The earliest window close among pending stops, if any. */
export function getEarliestPendingWindowEnd(route: Route): string | undefined {
  const ends = getPendingStops(route).map((stop) => stop.windowEnd)
  return ends.sort(compareTimes)[0]
}

/** Routes with a known driver or stop detail get the route context panel. */
export function hasRouteContext(route: Route | undefined): route is Route {
  return route !== undefined && (route.driver !== undefined || route.stops.length > 0)
}

/** "Stop 7" for a contact linked to a stop on this route. */
export function getStopLabel(route: Route | undefined, stopId: string | undefined): string | undefined {
  const stop = route?.stops.find((item) => item.id === stopId)
  return stop ? `Stop ${stop.number}` : undefined
}
