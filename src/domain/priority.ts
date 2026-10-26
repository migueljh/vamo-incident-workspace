// Severity, deadlines and queue order. Rules follow docs/BRIEF.md exactly.
import { capitalize } from '@/lib/capitalize'
import { pluralize } from '@/lib/pluralize'
import { CRITICAL_PENDING_STOPS, SEVERITY_ORDER, STATUS_ORDER } from './constants'
import { getIncidentContacts, getRoute } from './lookup'
import { getEarliestPendingWindowEnd, getPendingStopCount } from './route'
import { formatClosesIn, formatDuration, formatRelative, minutesUntil, NOW } from './time'
import type {
  Contact,
  DeadlineKind,
  Incident,
  IncidentType,
  Route,
  Severity,
  WorkspaceData,
} from './types'

/** A driver who can't move blocks every stop after them, so the whole route is at risk. */
const DRIVER_DISRUPTIONS: IncidentType[] = ['driver_stalled', 'driver_blocked', 'driver_unresponsive']

/** One customer or driver is affected right now, but not a whole route. */
const AFFECTED_NOW: IncidentType[] = ['wrong_address', 'missing_bag', 'route_not_visible']

export interface Deadline {
  kind: DeadlineKind
  at: string
}

export interface ReasonPart {
  kind: 'stops_at_risk' | 'deadline' | 'waiting_since' | 'fact'
  text: string
  /** Absolute time behind the part, when there is one. */
  at?: string
}

function isLinked(incident: Incident, contacts: Contact[]): boolean {
  if (incident.routeId) return true
  return contacts.some(
    (contact) => contact.linkedRouteId !== undefined || (contact.linkedOrderIds?.length ?? 0) > 0,
  )
}

/**
 * Severity from the brief:
 * - Needs linking: no contact matches an active order.
 * - Critical: driver stalled, blocked or unresponsive mid-route with 5+ pending stops.
 * - High: a customer or driver is affected right now, but not a whole route.
 * - Low: nothing at risk.
 */
export function getSeverity(incident: Incident, data: WorkspaceData): Severity {
  if (!isLinked(incident, getIncidentContacts(data, incident))) return 'needs_linking'

  const route = getRoute(data, incident.routeId)
  const isDriverDisruption = DRIVER_DISRUPTIONS.includes(incident.type)
  const pendingStops = route ? getPendingStopCount(route) : 0

  if (isDriverDisruption && pendingStops >= CRITICAL_PENDING_STOPS) return 'critical'
  if (isDriverDisruption || AFFECTED_NOW.includes(incident.type)) return 'high'
  return 'low'
}

/** The incident's own deadline, or the earliest pending window close on its route. */
export function getDeadline(incident: Incident, route: Route | undefined): Deadline | undefined {
  if (!incident.deadline) return undefined
  const at = incident.deadline.at ?? (route ? getEarliestPendingWindowEnd(route) : undefined)
  return at ? { kind: incident.deadline.kind, at } : undefined
}

export function countUnanswered(contacts: Contact[]): number {
  return contacts.filter((contact) => !contact.answered).length
}

/** "4 contacts waiting", "1 contact waiting" or "No contacts waiting". */
export function formatContactsWaiting(count: number): string {
  if (count === 0) return 'No contacts waiting'
  return `${pluralize(count, 'contact')} waiting`
}

function formatDeadline(deadline: Deadline, now: string): string {
  switch (deadline.kind) {
    case 'window_closes':
      return `window ${formatClosesIn(deadline.at, now)}`
    case 'driver_arrives':
      return `driver arriving ${formatRelative(deadline.at, now)}`
    case 'route_starts':
      return `route starts ${formatRelative(deadline.at, now)}`
  }
}

/** Plain-language parts of "why this is urgent", in the order the seed lists them. Resolved: none. */
export function getUrgencyReason(
  incident: Incident,
  data: WorkspaceData,
  now: string = NOW,
): ReasonPart[] {
  if (incident.status === 'resolved') return []
  const route = getRoute(data, incident.routeId)
  const parts: ReasonPart[] = []

  for (const signal of incident.urgency) {
    if (signal.kind === 'stops_at_risk' && route) {
      parts.push({ kind: 'stops_at_risk', text: `${pluralize(getPendingStopCount(route), 'stop')} at risk` })
    }
    if (signal.kind === 'deadline') {
      const deadline = getDeadline(incident, route)
      if (deadline) parts.push({ kind: 'deadline', text: formatDeadline(deadline, now), at: deadline.at })
    }
    if (signal.kind === 'waiting_since') {
      const waited = formatDuration(-minutesUntil(signal.at, now))
      parts.push({ kind: 'waiting_since', text: `${signal.who} waiting ${waited}`, at: signal.at })
    }
    if (signal.kind === 'fact') {
      parts.push({ kind: 'fact', text: signal.text })
    }
  }
  return parts
}

/** "9 stops at risk · window closes in 30 min", capitalized for display. */
export function formatReason(parts: ReasonPart[]): string {
  return capitalize(parts.map((part) => part.text).join(' · '))
}

interface SortKey {
  status: number
  severity: number
  minutesToDeadline: number
  unanswered: number
}

function getSortKey(incident: Incident, data: WorkspaceData, now: string): SortKey {
  const deadline = getDeadline(incident, getRoute(data, incident.routeId))
  return {
    status: STATUS_ORDER.indexOf(incident.status),
    severity: SEVERITY_ORDER.indexOf(getSeverity(incident, data)),
    minutesToDeadline: deadline ? minutesUntil(deadline.at, now) : Number.POSITIVE_INFINITY,
    unanswered: countUnanswered(getIncidentContacts(data, incident)),
  }
}

/**
 * Queue order from the brief: status (open → monitoring → resolved), then severity,
 * then minutes until deadline (none last), then unanswered contacts (most first).
 */
export function sortIncidents(data: WorkspaceData, now: string = NOW): Incident[] {
  const keys = new Map(data.incidents.map((incident) => [incident.id, getSortKey(incident, data, now)]))

  return [...data.incidents].sort((a, b) => {
    const keyA = keys.get(a.id) as SortKey
    const keyB = keys.get(b.id) as SortKey
    if (keyA.status !== keyB.status) return keyA.status - keyB.status
    if (keyA.severity !== keyB.severity) return keyA.severity - keyB.severity
    if (keyA.minutesToDeadline !== keyB.minutesToDeadline) {
      return keyA.minutesToDeadline < keyB.minutesToDeadline ? -1 : 1
    }
    return keyB.unanswered - keyA.unanswered
  })
}

/** The grouping line only helps when 2 or more signals (contacts + flags) were grouped. */
export function getGroupingReason(incident: Incident): string | undefined {
  const signals = incident.contactIds.length + incident.flagIds.length
  return signals >= 2 ? incident.groupingReason : undefined
}

/** Shown instead of urgency once an incident is resolved: "Resolved by Ana". */
export function formatResolvedBy(resolvedBy: string | undefined): string {
  return resolvedBy ? `Resolved by ${resolvedBy}` : 'Resolved'
}
