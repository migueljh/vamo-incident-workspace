import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { SeverityBadge } from '@/components/ds/severity-badge'
import { StatusBadge } from '@/components/ds/status-badge'
import { Button } from '@/components/ui/button'
import { formatOwner } from '@/domain/constants'
import { getIncidentContacts, getRoute } from '@/domain/lookup'
import {
  countUnanswered,
  formatContactsWaiting,
  getGroupingReason,
  getSeverity,
  getUrgencyReason,
} from '@/domain/priority'
import { formatEt } from '@/domain/time'
import type { Incident, WorkspaceData } from '@/domain/types'
import { capitalize } from '@/lib/capitalize'
import { cn } from '@/lib/utils'

interface IncidentHeaderProps {
  incident: Incident
  data: WorkspaceData
  onCollapse: () => void
}

export function IncidentHeader({ incident, data, onCollapse }: IncidentHeaderProps) {
  const severity = getSeverity(incident, data)
  const business = getRoute(data, incident.routeId)?.business
  const reasonParts = getUrgencyReason(incident, data)
  const contactsWaiting = formatContactsWaiting(countUnanswered(getIncidentContacts(data, incident)))
  const isLoud = severity === 'critical' && incident.status === 'open'
  const groupingReason = getGroupingReason(incident)

  return (
    <header className="flex flex-col gap-1.5 border-b border-line-soft px-5 pt-3.5 pb-3">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <SeverityBadge severity={severity} />
        <h2 className="text-lg font-semibold tracking-tight">
          {incident.subject} · {incident.title}
        </h2>
        {business && <span className="text-soft-foreground">{business}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          <StatusBadge key={incident.status} status={incident.status} className="animate-fade" />
          <span className={cn('text-xs', incident.owner ? 'text-foreground' : 'text-muted-foreground')}>
            {formatOwner(incident.owner)}
          </span>
          <Button variant="outline" size="sm" onClick={onCollapse} aria-label="Collapse incident panel">
            Collapse
            <ChevronRight data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </div>
      <p className="flex flex-wrap items-baseline gap-x-2 text-base font-medium">
        {reasonParts.map((part, index) => (
          <Fragment key={part.kind}>
            <span className={cn(part.kind === 'deadline' && isLoud && 'text-critical-strong')}>
              {index === 0 ? capitalize(part.text) : part.text}
            </span>
            {part.kind === 'deadline' && part.at && (
              <span className="font-mono text-xs text-muted-foreground">{formatEt(part.at)}</span>
            )}
            <span aria-hidden className="text-faint-foreground">
              ·
            </span>
          </Fragment>
        ))}
        <span>{contactsWaiting}</span>
      </p>
      {groupingReason && <p className="text-xs text-soft-foreground">{groupingReason}</p>}
    </header>
  )
}
