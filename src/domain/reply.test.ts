import { describe, expect, it } from 'vitest'
import { getSendBlocker } from './reply'

describe('getSendBlocker', () => {
  it('allows sending with recipients and a reply, note or not', () => {
    expect(getSendBlocker(4, 4, 'Hi')).toBeNull()
  })

  it('asks for a recipient when all were removed', () => {
    expect(getSendBlocker(4, 0, 'Hi')).toBe('Add at least one recipient')
  })

  it('asks for a reply when it is empty or whitespace', () => {
    expect(getSendBlocker(4, 2, '   ')).toBe('Write a reply')
  })

  it('says nobody is waiting once every contact is answered', () => {
    expect(getSendBlocker(0, 0, 'Hi')).toBe('No contacts waiting')
  })
})
