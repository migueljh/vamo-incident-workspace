import { describe, expect, it } from 'vitest'
import { getLateMinutes, getPendingStopCount, hasRouteContext } from './route'
import { etTime } from './time'
import type { Route, Stop } from './types'

const STOP: Stop = {
  id: 's1',
  number: 1,
  customerName: 'Dana R.',
  address: '1 Main St',
  windowStart: etTime('11:30'),
  windowEnd: etTime('12:30'),
  status: 'pending',
}

describe('missing route data', () => {
  it('treats a stop without ETA as not late', () => {
    expect(getLateMinutes(STOP)).toBe(0)
    expect(getLateMinutes({ ...STOP, eta: etTime('12:41') })).toBe(11)
  })

  it('shows route context for a driver without location, ping or stops', () => {
    const route: Route = { id: 'r', name: 'Route 40', driver: { name: 'Jamal R.' }, stops: [] }
    expect(hasRouteContext(route)).toBe(true)
    expect(getPendingStopCount(route)).toBe(0)
  })

  it('hides route context when nothing is known', () => {
    expect(hasRouteContext({ id: 'r', name: 'Route 9', stops: [] })).toBe(false)
    expect(hasRouteContext(undefined)).toBe(false)
  })
})
