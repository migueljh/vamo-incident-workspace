// Domain types for the Incident Workspace. All times are ISO 8601 strings.

export type Severity = 'critical' | 'high' | 'low' | 'needs_linking'

export type IncidentStatus = 'open' | 'monitoring' | 'resolved'

export type SourceRole = 'driver' | 'customer' | 'business' | 'unknown'

/** Who produced a timeline event: a contact's role, or one of the non-contact sources. */
export type TimelineSource = SourceRole | 'board' | 'system' | 'agent'

export type ContactChannel = 'sms' | 'call'

export type TimelineChannel = ContactChannel | 'flag' | 'app_ping' | 'note' | 'action'

export type StopStatus = 'pending' | 'arrived' | 'delivered'

export type BoardFlagType =
  | 'stalled_driver'
  | 'late_pickup'
  | 'driver_cancelled'
  | 'delivered_far_from_address'

export type IncidentType =
  | 'driver_stalled'
  | 'driver_blocked'
  | 'driver_unresponsive'
  | 'wrong_address'
  | 'missing_bag'
  | 'route_not_visible'
  | 'pod_request'
  | 'unlinked_contact'

/** What a deadline means, so the UI can say it in plain words. */
export type DeadlineKind = 'window_closes' | 'driver_arrives' | 'route_starts'

/** call_driver and log_outcome drive the hero flow; log_step simulates any other next step. */
export type NextStepAction = 'call_driver' | 'log_outcome' | 'log_step'

export interface Driver {
  name: string
  phone?: string
}

export interface AppPing {
  at: string
  responded: boolean
}

export interface Stop {
  id: string
  number: number
  customerName: string
  address: string
  windowStart: string
  windowEnd: string
  /** Missing when the routing engine has no estimate. */
  eta?: string
  status: StopStatus
  podPhotoUrl?: string
}

export interface Route {
  id: string
  name: string
  business?: string
  driver?: Driver
  lastLocationAt?: string
  lastAppPing?: AppPing
  /** Full stop detail. Empty for short-context routes. */
  stops: Stop[]
  /** Pending stop count reported by the board when stop detail isn't loaded. */
  reportedPendingStops?: number
}

export interface BoardFlag {
  id: string
  routeId: string
  type: BoardFlagType
  raisedAt: string
  detail: string
}

export interface Contact {
  id: string
  channel: ContactChannel
  sourceRole: SourceRole
  senderName?: string
  phone: string
  /** SMS text, or a summary of the call. */
  text: string
  receivedAt: string
  linkedRouteId?: string
  linkedStopId?: string
  /** Orders the contact is about, when it isn't tied to an active route. */
  linkedOrderIds?: string[]
  answered: boolean
}

export interface NextStep {
  label: string
  reason: string
  action?: NextStepAction
}

export interface IncidentDeadline {
  kind: DeadlineKind
  /** Omitted when the deadline is derived from the route's stop windows. */
  at?: string
}

/** One plain-language part of "why this is urgent". Time-based parts are computed at render. */
export type UrgencySignal =
  | { kind: 'stops_at_risk' }
  | { kind: 'deadline' }
  | { kind: 'waiting_since'; who: string; at: string }
  | { kind: 'fact'; text: string }

export type AgentActivity =
  | { id: string; kind: 'call'; at: string; author: string; driverName: string }
  | { id: string; kind: 'note'; at: string; author: string; text: string }
  /** A simulated step or status change, e.g. "Step done (simulated)" with the step as detail. */
  | { id: string; kind: 'step'; at: string; author: string; text: string; detail?: string }
  | {
      id: string
      kind: 'reply'
      at: string
      author: string
      text: string
      recipientIds: string[]
    }

export interface Incident {
  id: string
  /** Route name, business or "Unknown number". */
  subject: string
  /** What's happening, in a few words. */
  title: string
  type: IncidentType
  routeId?: string
  flagIds: string[]
  contactIds: string[]
  status: IncidentStatus
  owner?: string
  /** Who marked it resolved; independent of the owner. */
  resolvedBy?: string
  nextStep: NextStep
  deadline?: IncidentDeadline
  urgency: UrgencySignal[]
  /** Why several signals were grouped. Shown only when there are 2 or more. */
  groupingReason?: string
  /** Next step after replying, when the seed knows better than the generic follow-up. */
  followUpStep?: NextStep
  /** Default reply for the composer. */
  replyTemplate?: string
  activity: AgentActivity[]
}

export interface WorkspaceData {
  incidents: Incident[]
  routes: Route[]
  contacts: Contact[]
  flags: BoardFlag[]
}

export interface TimelineEvent {
  id: string
  at: string
  source: TimelineSource
  channel: TimelineChannel
  title: string
  subtitle?: string
  body?: string
  /** Only set for inbound contacts. */
  answered?: boolean
}
