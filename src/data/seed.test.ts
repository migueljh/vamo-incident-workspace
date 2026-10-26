import { describe, expect, it } from 'vitest'
import { getIncident, getIncidentContacts, getRoute } from '@/domain/lookup'
import {
  countUnanswered,
  formatReason,
  getDeadline,
  getSeverity,
  getUrgencyReason,
  sortIncidents,
} from '@/domain/priority'
import { getLateMinutes, getPendingStops, getStopProgress } from '@/domain/route'
import { formatEt } from '@/domain/time'
import { HERO_INCIDENT_ID, SEED } from './seed'

function incident(id: string) {
  const found = getIncident(SEED, id)
  if (!found) throw new Error(`Missing seed incident ${id}`)
  return found
}

describe('seed severity', () => {
  it.each([
    ['incident-route-14', 'critical'],
    ['incident-route-22', 'critical'],
    ['incident-route-31', 'high'],
    ['incident-route-40', 'high'],
    ['incident-route-9', 'high'],
    ['incident-greenbasket', 'low'],
    ['incident-unknown', 'needs_linking'],
  ])('%s is %s', (id, severity) => {
    expect(getSeverity(incident(id), SEED)).toBe(severity)
  })
})

describe('seed queue order', () => {
  const expected = [
    'incident-route-14',
    'incident-route-22',
    'incident-route-31',
    'incident-route-40',
    'incident-route-9',
    'incident-greenbasket',
    'incident-unknown',
  ]

  it('sorts to the brief order 1 to 7', () => {
    expect(sortIncidents(SEED).map((item) => item.id)).toEqual(expected)
  })

  it('reaches the same order regardless of input order', () => {
    const shuffled = { ...SEED, incidents: [...SEED.incidents].reverse() }
    expect(sortIncidents(shuffled).map((item) => item.id)).toEqual(expected)
  })
})

describe('seed deadlines', () => {
  it.each([
    ['incident-route-14', '12:30 PM ET'],
    ['incident-route-22', '12:48 PM ET'],
    ['incident-route-31', '12:12 PM ET'],
    ['incident-route-40', '12:55 PM ET'],
  ])('%s is due at %s', (id, time) => {
    const item = incident(id)
    const deadline = getDeadline(item, getRoute(SEED, item.routeId))
    expect(deadline && formatEt(deadline.at)).toBe(time)
  })

  it.each(['incident-route-9', 'incident-greenbasket', 'incident-unknown'])('%s has no deadline', (id) => {
    const item = incident(id)
    expect(getDeadline(item, getRoute(SEED, item.routeId))).toBeUndefined()
  })
})

describe('Route 14 hero', () => {
  const hero = incident(HERO_INCIDENT_ID)
  const route = getRoute(SEED, hero.routeId)

  it('has 4 contacts waiting and a plain-language reason', () => {
    expect(countUnanswered(getIncidentContacts(SEED, hero))).toBe(4)
    expect(formatReason(getUrgencyReason(hero, SEED))).toBe('9 stops at risk · window closes in 30 min')
  })

  it('has 6 of 15 stops delivered and 9 pending', () => {
    expect(route && getStopProgress(route)).toEqual({ delivered: 6, pending: 9, total: 15 })
  })

  it('shows stops 7 to 9 first, with Stop 7 and 9 late', () => {
    const next = route ? getPendingStops(route).slice(0, 3) : []
    expect(next.map((stop) => [stop.number, getLateMinutes(stop)])).toEqual([
      [7, 11],
      [8, 0],
      [9, 8],
    ])
  })
})

describe('secondary reasons', () => {
  it.each([
    ['incident-route-22', 'Driver waiting 6 min · 11 stops at risk'],
    ['incident-route-31', 'Driver arriving in 12 min'],
    ['incident-route-40', 'Route starts in 55 min'],
    ['incident-route-9', 'Order delivered 11:40 AM ET'],
    ['incident-greenbasket', '3 delivered orders'],
    ['incident-unknown', 'No matching order found'],
  ])('%s reads "%s"', (id, reason) => {
    expect(formatReason(getUrgencyReason(incident(id), SEED))).toBe(reason)
  })
})
