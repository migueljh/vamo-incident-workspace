// Next-step wording for the golden path, shared by the reducer and the composer.
import { pluralize } from '@/lib/pluralize'
import { FOLLOW_UP_MINUTES } from './constants'
import { addMinutes, formatEt } from './time'
import type { NextStep } from './types'

/** After "Call driver": the agent is on the phone and should log what happened. */
export function getCallingDriverStep(driverName: string): NextStep {
  return {
    label: `Calling driver ${driverName}`,
    reason: 'Log the outcome in the note below, then reply to contacts.',
    action: 'log_outcome',
  }
}

/** After replying: keep an eye on the incident until the follow-up time. */
export function getFollowUpStep(sentAt: string, recipientCount: number, hasDriver: boolean): NextStep {
  const by = formatEt(addMinutes(sentAt, FOLLOW_UP_MINUTES))
  return {
    label: hasDriver ? `Confirm driver is moving again by ${by}.` : `Follow up with contacts by ${by}.`,
    reason: `Reply sent to ${pluralize(recipientCount, 'contact')} (simulated). Status is Monitoring.`,
  }
}

/** Prefill for the internal note when logging a call outcome. */
export function getCallNotePrefix(driverName: string, calledAt: string): string {
  return `Called ${driverName} at ${formatEt(calledAt)}. Outcome: `
}
