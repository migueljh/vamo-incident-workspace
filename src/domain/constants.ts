// Labels and style keys for domain enums. Components read these through the helpers below.
import type {
  BoardFlagType,
  IncidentStatus,
  Severity,
  TimelineChannel,
  TimelineSource,
} from './types'

/** The signed-in agent. There is no auth; this is the demo user. */
export const CURRENT_AGENT = 'Ana'

export const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'low', 'needs_linking']

export const STATUS_ORDER: IncidentStatus[] = ['open', 'monitoring', 'resolved']

/** A stalled or blocked driver is Critical only when this many stops are still pending. */
export const CRITICAL_PENDING_STOPS = 5

/** How long after replying the agent should re-check a stalled driver. */
export const FOLLOW_UP_MINUTES = 15

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  low: 'Low',
  needs_linking: 'Needs linking',
}

const SEVERITY_CLASSES: Record<Severity, string> = {
  critical: 'border-critical bg-critical text-critical-foreground',
  high: 'border-high-line bg-high-soft text-high-strong',
  low: 'border-input bg-card text-soft-foreground',
  needs_linking: 'border-dashed border-line-dashed bg-card text-soft-foreground',
}

const STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
}

const STATUS_CLASSES: Record<IncidentStatus, string> = {
  open: 'border-line-strong bg-card text-foreground',
  monitoring: 'border-tag bg-tag text-tag-foreground',
  resolved: 'border-dashed border-input bg-card text-muted-foreground',
}

const SOURCE_LABELS: Record<TimelineSource, string> = {
  driver: 'Driver',
  customer: 'Customer',
  business: 'Business',
  unknown: 'Unknown',
  board: 'Board',
  system: 'System',
  agent: 'Agent',
}

const SOURCE_TAG_CLASSES: Record<TimelineSource, string> = {
  driver: 'bg-tag text-tag-foreground',
  customer: 'bg-tag text-tag-foreground',
  business: 'bg-tag text-tag-foreground',
  unknown: 'bg-tag text-tag-foreground',
  board: 'bg-critical-soft text-critical-strong',
  system: 'bg-tag text-tag-foreground',
  agent: 'bg-primary text-primary-foreground',
}

const SOURCE_DOT_CLASSES: Record<TimelineSource, string> = {
  driver: 'bg-soft-foreground',
  customer: 'bg-soft-foreground',
  business: 'bg-soft-foreground',
  unknown: 'bg-soft-foreground',
  board: 'bg-critical',
  system: 'bg-faint-foreground',
  agent: 'bg-foreground',
}

const CHANNEL_LABELS: Record<TimelineChannel, string> = {
  sms: 'SMS',
  call: 'Call',
  flag: 'Flag',
  app_ping: 'App ping',
  note: 'Note',
}

const FLAG_LABELS: Record<BoardFlagType, string> = {
  stalled_driver: 'Driver stalled',
  late_pickup: 'Late pickup',
  driver_cancelled: 'Driver cancelled',
  delivered_far_from_address: 'Delivered far from address',
}

export function getSeverityLabel(severity: Severity): string {
  return SEVERITY_LABELS[severity]
}

export function getSeverityClasses(severity: Severity): string {
  return SEVERITY_CLASSES[severity]
}

export function getStatusLabel(status: IncidentStatus): string {
  return STATUS_LABELS[status]
}

export function getStatusClasses(status: IncidentStatus): string {
  return STATUS_CLASSES[status]
}

export function getSourceLabel(source: TimelineSource): string {
  return SOURCE_LABELS[source]
}

export function getSourceTagClasses(source: TimelineSource): string {
  return SOURCE_TAG_CLASSES[source]
}

export function getSourceDotClasses(source: TimelineSource): string {
  return SOURCE_DOT_CLASSES[source]
}

export function getChannelLabel(channel: TimelineChannel): string {
  return CHANNEL_LABELS[channel]
}

export function getFlagLabel(type: BoardFlagType): string {
  return FLAG_LABELS[type]
}

/** "Ana (you)", "Carlos" or "Unassigned". */
export function formatOwner(owner: string | undefined): string {
  if (!owner) return 'Unassigned'
  return owner === CURRENT_AGENT ? `${owner} (you)` : owner
}
