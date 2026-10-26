import { describe, expect, it } from 'vitest'
import {
  addMinutes,
  etTime,
  formatClosesIn,
  formatDuration,
  formatEt,
  formatEtWindow,
  formatRelative,
  minutesUntil,
  NOW,
} from './time'

describe('NOW', () => {
  it('is 12:00 PM ET', () => {
    expect(formatEt(NOW)).toBe('12:00 PM ET')
  })
})

describe('formatEt', () => {
  it('formats morning and afternoon times in ET', () => {
    expect(formatEt(etTime('11:42'))).toBe('11:42 AM ET')
    expect(formatEt(etTime('13:08'))).toBe('1:08 PM ET')
  })

  it('can drop the zone suffix', () => {
    expect(formatEt(etTime('12:41'), { zone: false })).toBe('12:41 PM')
  })

  it('formats UTC timestamps in ET', () => {
    expect(formatEt(addMinutes(NOW, 15))).toBe('12:15 PM ET')
  })
})

describe('formatEtWindow', () => {
  it('keeps both periods when they differ', () => {
    expect(formatEtWindow(etTime('11:30'), etTime('12:30'))).toBe('11:30 AM – 12:30 PM ET')
  })

  it('shares the period when both ends match', () => {
    expect(formatEtWindow(etTime('12:00'), etTime('13:00'))).toBe('12:00 – 1:00 PM ET')
  })
})

describe('minutesUntil', () => {
  it('counts minutes from NOW', () => {
    expect(minutesUntil(etTime('12:30'))).toBe(30)
    expect(minutesUntil(etTime('11:42'))).toBe(-18)
  })
})

describe('formatDuration', () => {
  it('uses minutes under an hour and hours above', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(60)).toBe('1 hr')
    expect(formatDuration(65)).toBe('1 hr 5 min')
  })
})

describe('formatRelative', () => {
  it('describes past, present and future times', () => {
    expect(formatRelative(etTime('11:42'))).toBe('18 min ago')
    expect(formatRelative(NOW)).toBe('just now')
    expect(formatRelative(etTime('12:12'))).toBe('in 12 min')
  })
})

describe('formatClosesIn', () => {
  it('describes a window closing', () => {
    expect(formatClosesIn(etTime('12:30'))).toBe('closes in 30 min')
    expect(formatClosesIn(NOW)).toBe('closes now')
    expect(formatClosesIn(etTime('11:55'))).toBe('closed 5 min ago')
  })
})
