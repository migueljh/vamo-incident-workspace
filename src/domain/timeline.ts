// One chronological feed per incident, derived from flags, contacts, route pings and agent actions.
import { pluralize } from '@/lib/pluralize'
import { getFlagLabel } from './constants'
import { getIncidentContacts, getIncidentFlags, getRoute } from './lookup'
import { compareTimes } from './time'
import type { AgentActivity, Contact, Incident, Route, TimelineEvent, WorkspaceData } from './types'

function getStopLabel(route: Route | undefined, stopId: string | undefined): string | undefined {
  const stop = route?.stops.find((item) => item.id === stopId)
  return stop ? `Stop ${stop.number}` : undefined
}

function contactToEvent(contact: Contact, route: Route | undefined): TimelineEvent {
  return {
    id: contact.id,
    at: contact.receivedAt,
    source: contact.sourceRole,
    channel: contact.channel,
    title: contact.senderName ?? contact.phone,
    subtitle: getStopLabel(route, contact.linkedStopId),
    // SMS is quoted verbatim; calls are a summary.
    body: contact.channel === 'sms' ? `"${contact.text}"` : contact.text,
    answered: contact.answered,
  }
}

function activityToEvent(activity: AgentActivity, contacts: Contact[]): TimelineEvent {
  const base = { id: activity.id, at: activity.at, source: 'agent' as const }
  switch (activity.kind) {
    case 'call':
      return { ...base, channel: 'call', title: 'Call to driver (simulated)', subtitle: activity.driverName }
    case 'note':
      return { ...base, channel: 'note', title: 'Internal note', subtitle: `by ${activity.author}`, body: activity.text }
    case 'reply': {
      const names = contacts
        .filter((contact) => activity.recipientIds.includes(contact.id))
        .map((contact) => contact.senderName ?? contact.phone)
      return {
        ...base,
        channel: 'sms',
        title: `Reply sent to ${pluralize(activity.recipientIds.length, 'contact')} (simulated)`,
        subtitle: names.join(', '),
        body: activity.text,
      }
    }
  }
}

/** All events for an incident, oldest first. Same-time events keep their insertion order. */
export function getTimeline(incident: Incident, data: WorkspaceData): TimelineEvent[] {
  const route = getRoute(data, incident.routeId)
  const contacts = getIncidentContacts(data, incident)
  const events: TimelineEvent[] = []

  for (const flag of getIncidentFlags(data, incident)) {
    events.push({
      id: flag.id,
      at: flag.raisedAt,
      source: 'board',
      channel: 'flag',
      title: getFlagLabel(flag.type),
      body: flag.detail,
    })
  }

  const ping = route?.lastAppPing
  if (ping && !ping.responded && route?.driver) {
    events.push({
      id: `${route.id}-app-ping`,
      at: ping.at,
      source: 'system',
      channel: 'app_ping',
      title: `Ping to ${route.driver.name}`,
      body: 'No response.',
    })
  }

  events.push(...contacts.map((contact) => contactToEvent(contact, route)))
  events.push(...incident.activity.map((activity) => activityToEvent(activity, contacts)))

  return events.sort((a, b) => compareTimes(a.at, b.at))
}
