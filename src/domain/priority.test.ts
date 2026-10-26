import { describe, expect, it } from 'vitest'
import {
  countUnanswered,
  formatContactsWaiting,
  formatReason,
  getDeadline,
  getSeverity,
  getUrgencyReason,
  sortIncidents,
} from './priority'
import { etTime } from './time'
import type { Contact, Incident, Route, Stop, WorkspaceData } from './types'

function makeStop(number: number, overrides: Partial<Stop> = {}): Stop {
  return {
    id: `stop-${number}`,
    number,
    customerName: `Customer ${number}`,
    address: `${number} Main St`,
    windowStart: etTime('12:00'),
    windowEnd: etTime('13:00'),
    eta: etTime('12:30'),
    status: 'pending',
    ...overrides,
  }
}

function makeRoute(id: string, pendingStops: number, overrides: Partial<Route> = {}): Route {
  return {
    id,
    name: id,
    stops: Array.from({ length: pendingStops }, (_, index) => makeStop(index + 1)),
    ...overrides,
  }
}

function makeContact(id: string, overrides: Partial<Contact> = {}): Contact {
  return {
    id,
    channel: 'sms',
    sourceRole: 'customer',
    phone: '(555) 010-0000',
    text: 'Where is my order?',
    receivedAt: etTime('11:50'),
    answered: false,
    ...overrides,
  }
}

function makeIncident(id: string, overrides: Partial<Incident> = {}): Incident {
  return {
    id,
    subject: id,
    title: 'Incident',
    type: 'driver_stalled',
    flagIds: [],
    contactIds: [],
    status: 'open',
    nextStep: { label: 'Do something', reason: 'Because' },
    urgency: [],
    groupingReason: 'Grouped by route.',
    activity: [],
    ...overrides,
  }
}

function makeData(partial: Partial<WorkspaceData>): WorkspaceData {
  return { incidents: [], routes: [], contacts: [], flags: [], ...partial }
}

describe('getSeverity', () => {
  it('is critical when a driver is stalled with 5 or more pending stops', () => {
    const data = makeData({ routes: [makeRoute('r1', 5)] })
    expect(getSeverity(makeIncident('i', { routeId: 'r1' }), data)).toBe('critical')
  })

  it('is critical when a blocked driver relies on the board count of pending stops', () => {
    const data = makeData({ routes: [makeRoute('r1', 0, { reportedPendingStops: 11 })] })
    const incident = makeIncident('i', { type: 'driver_blocked', routeId: 'r1' })
    expect(getSeverity(incident, data)).toBe('critical')
  })

  it('is high when a driver is stalled with fewer than 5 pending stops', () => {
    const data = makeData({ routes: [makeRoute('r1', 4)] })
    expect(getSeverity(makeIncident('i', { routeId: 'r1' }), data)).toBe('high')
  })

  it('is high when one customer or driver is affected right now', () => {
    const data = makeData({ routes: [makeRoute('r1', 0)] })
    for (const type of ['wrong_address', 'missing_bag', 'route_not_visible'] as const) {
      expect(getSeverity(makeIncident('i', { type, routeId: 'r1' }), data)).toBe('high')
    }
  })

  it('is low when nothing is at risk', () => {
    const contact = makeContact('c1', { sourceRole: 'business', linkedOrderIds: ['#1'] })
    const data = makeData({ contacts: [contact] })
    const incident = makeIncident('i', { type: 'pod_request', contactIds: ['c1'] })
    expect(getSeverity(incident, data)).toBe('low')
  })

  it('needs linking when no contact matches an active order', () => {
    const data = makeData({ contacts: [makeContact('c1', { sourceRole: 'unknown' })] })
    const incident = makeIncident('i', { type: 'unlinked_contact', contactIds: ['c1'] })
    expect(getSeverity(incident, data)).toBe('needs_linking')
  })
})

describe('getDeadline', () => {
  it('derives a window deadline from the earliest pending window close', () => {
    const route = makeRoute('r1', 0, {
      stops: [
        makeStop(1, { status: 'delivered', windowEnd: etTime('11:00') }),
        makeStop(2, { windowEnd: etTime('13:00') }),
        makeStop(3, { windowEnd: etTime('12:30') }),
      ],
    })
    const incident = makeIncident('i', { routeId: 'r1', deadline: { kind: 'window_closes' } })
    expect(getDeadline(incident, route)).toEqual({ kind: 'window_closes', at: etTime('12:30') })
  })

  it('uses an explicit deadline when the incident has one', () => {
    const incident = makeIncident('i', { deadline: { kind: 'route_starts', at: etTime('12:55') } })
    expect(getDeadline(incident, undefined)).toEqual({ kind: 'route_starts', at: etTime('12:55') })
  })

  it('is undefined without a deadline', () => {
    expect(getDeadline(makeIncident('i'), undefined)).toBeUndefined()
  })
})

describe('countUnanswered', () => {
  it('counts contacts not yet answered', () => {
    const contacts = [makeContact('a'), makeContact('b', { answered: true }), makeContact('c')]
    expect(countUnanswered(contacts)).toBe(2)
  })

  it('formats the waiting count', () => {
    expect(formatContactsWaiting(4)).toBe('4 contacts waiting')
    expect(formatContactsWaiting(1)).toBe('1 contact waiting')
    expect(formatContactsWaiting(0)).toBe('No contacts waiting')
  })
})

describe('getUrgencyReason', () => {
  it('explains urgency in plain words', () => {
    const route = makeRoute('r1', 9, {
      stops: Array.from({ length: 9 }, (_, index) =>
        makeStop(index + 1, { windowEnd: etTime(index === 0 ? '12:30' : '13:00') }),
      ),
    })
    const incident = makeIncident('i', {
      routeId: 'r1',
      deadline: { kind: 'window_closes' },
      urgency: [{ kind: 'stops_at_risk' }, { kind: 'deadline' }],
    })
    const parts = getUrgencyReason(incident, makeData({ routes: [route] }))
    expect(formatReason(parts)).toBe('9 stops at risk · window closes in 30 min')
  })

  it('describes waiting time, arrival deadlines and facts', () => {
    const incident = makeIncident('i', {
      deadline: { kind: 'driver_arrives', at: etTime('12:12') },
      urgency: [
        { kind: 'waiting_since', who: 'driver', at: etTime('11:54') },
        { kind: 'deadline' },
        { kind: 'fact', text: 'wrong apartment' },
      ],
    })
    const parts = getUrgencyReason(incident, makeData({}))
    expect(formatReason(parts)).toBe('Driver waiting 6 min · driver arriving in 12 min · wrong apartment')
  })
})

describe('sortIncidents', () => {
  const routes = [makeRoute('big', 9), makeRoute('small', 0)]
  const contacts = [makeContact('c1'), makeContact('c2'), makeContact('c3')]

  it('orders by status, then severity, then deadline, then unanswered contacts', () => {
    const data = makeData({
      routes,
      contacts,
      incidents: [
        makeIncident('monitoring-critical', { routeId: 'big', status: 'monitoring' }),
        makeIncident('high-no-deadline', { type: 'missing_bag', routeId: 'small' }),
        makeIncident('high-later', {
          type: 'missing_bag',
          routeId: 'small',
          deadline: { kind: 'route_starts', at: etTime('12:55') },
        }),
        makeIncident('high-sooner', {
          type: 'missing_bag',
          routeId: 'small',
          deadline: { kind: 'driver_arrives', at: etTime('12:12') },
        }),
        makeIncident('critical', { routeId: 'big' }),
      ],
    })
    expect(sortIncidents(data).map((incident) => incident.id)).toEqual([
      'critical',
      'high-sooner',
      'high-later',
      'high-no-deadline',
      'monitoring-critical',
    ])
  })

  it('breaks deadline ties by unanswered contacts, most first', () => {
    const data = makeData({
      routes,
      contacts,
      incidents: [
        makeIncident('one', { type: 'missing_bag', routeId: 'small', contactIds: ['c1'] }),
        makeIncident('two', { type: 'missing_bag', routeId: 'small', contactIds: ['c2', 'c3'] }),
      ],
    })
    expect(sortIncidents(data).map((incident) => incident.id)).toEqual(['two', 'one'])
  })
})
