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
export function getFollowUpStep(sentAt: string, recipientCount: number, isDriverStall: boolean): NextStep {
  const by = formatEt(addMinutes(sentAt, FOLLOW_UP_MINUTES))
  return {
    label: isDriverStall ? `Confirm driver is moving again by ${by}.` : `Follow up with contacts by ${by}.`,
    reason: `Reply sent to ${pluralize(recipientCount, 'contact')} (simulated). Check back if they write again.`,
  }
}

/** Prefill for the internal note when logging a call outcome. */
export function getCallNotePrefix(driverName: string, calledAt: string): string {
  return `Called ${driverName} at ${formatEt(calledAt)}. Outcome: `
}

/** Timeline text for a simulated next step; the step itself goes in the event body. */
export const STEP_DONE_TEXT = 'Step done (simulated)'

/** Timeline text for resolving; the event's "by <name>" names who did it. */
export const RESOLVED_TEXT = 'Resolved'

/** After a simulated next step: the step stays visible, without the button. */
export function getStepDoneStep(label: string): NextStep {
  return { label, reason: 'Done (simulated). Reply to let the contact know.' }
}

/** After "Resolve incident": nothing left to do. */
export function getResolvedStep(): NextStep {
  return { label: 'Resolved.', reason: 'No further action needed.' }
}
