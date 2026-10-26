import { Panel } from '@/components/ds/panel'
import { SectionLabel } from '@/components/ds/section-label'
import { Button } from '@/components/ui/button'
import { CURRENT_AGENT, getNextStepActionLabel } from '@/domain/constants'
import type { NextStep } from '@/domain/types'

interface NextStepCardProps {
  nextStep: NextStep
  owner: string | undefined
  canAssign: boolean
  onAssign?: () => void
  onAction?: () => void
}

/** Pinned at the top of the incident: what to do next, why, and the action to do it. */
export function NextStepCard({ nextStep, owner, canAssign, onAssign, onAction }: NextStepCardProps) {
  const isMine = owner === CURRENT_AGENT

  return (
    <div className="border-b border-line-soft px-5 py-3">
      <Panel
        tone="subtle"
        aria-labelledby="next-step-label"
        className="flex-row flex-wrap items-center gap-4 px-3.5 py-3"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <SectionLabel id="next-step-label">Next step</SectionLabel>
          <span className="text-md font-semibold">{nextStep.label}</span>
          <span className="text-soft-foreground">{nextStep.reason}</span>
        </div>
        <div className="flex gap-2">
          {canAssign &&
            (isMine ? (
              <Button
                variant="secondary"
                size="md"
                disabled
                className="border-border text-soft-foreground disabled:opacity-100"
              >
                Assigned to you
              </Button>
            ) : (
              <Button variant="outline" size="md" onClick={onAssign} disabled={!onAssign}>
                Assign to me
              </Button>
            ))}
          {nextStep.action && (
            <Button size="md" onClick={onAction} disabled={!onAction} className="font-semibold">
              {getNextStepActionLabel(nextStep.action)}
            </Button>
          )}
        </div>
      </Panel>
    </div>
  )
}
