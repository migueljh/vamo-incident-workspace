import { ChevronLeft } from 'lucide-react'
import { SeverityBadge } from '@/components/ds/severity-badge'
import { Button } from '@/components/ui/button'
import type { Incident, Severity } from '@/domain/types'

interface CollapsedRailProps {
  incident: Incident | undefined
  severity: Severity | undefined
  onExpand: () => void
}

/** The incident panel folded to a thin rail so the queue can use the width. */
export function CollapsedRail({ incident, severity, onExpand }: CollapsedRailProps) {
  return (
    <div className="flex w-13 shrink-0 flex-col items-center gap-3.5 bg-card py-3">
      <Button variant="outline" size="icon-sm" onClick={onExpand} aria-label="Expand incident panel">
        <ChevronLeft aria-hidden />
      </Button>
      {incident && (
        <button
          type="button"
          onClick={onExpand}
          className="flex rotate-180 items-center gap-2 rounded-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-(--duration-fast) ease-out outline-none [writing-mode:vertical-rl] hover:text-soft-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {incident.subject} · {incident.title}
          {severity && <SeverityBadge severity={severity} />}
        </button>
      )}
    </div>
  )
}
