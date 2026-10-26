import { SeverityBadge } from '@/components/ds/severity-badge'
import { StatusBadge } from '@/components/ds/status-badge'
import { formatOwner } from '@/domain/constants'
import { getIncidentContacts } from '@/domain/lookup'
import {
  countUnanswered,
  formatContactsWaiting,
  formatReason,
  getSeverity,
  getUrgencyReason,
} from '@/domain/priority'
import type { Incident, WorkspaceData } from '@/domain/types'
import { cn } from '@/lib/utils'

interface IncidentCardProps {
  incident: Incident
  data: WorkspaceData
  selected: boolean
  onSelect: (incidentId: string) => void
}

export function IncidentCard({ incident, data, selected, onSelect }: IncidentCardProps) {
  const isOpen = incident.status === 'open'
  const reason = formatReason(getUrgencyReason(incident, data))
  const contactsWaiting = formatContactsWaiting(countUnanswered(getIncidentContacts(data, incident)))

  return (
    <button
      type="button"
      onClick={() => onSelect(incident.id)}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'flex w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        isOpen ? 'bg-card hover:border-line-hover' : 'border-line-soft bg-surface-subtle hover:border-line-hover',
        selected && 'border-foreground ring-1 ring-foreground hover:border-foreground',
      )}
    >
      <div className="flex w-full items-center gap-2">
        {isOpen ? (
          <SeverityBadge severity={getSeverity(incident, data)} />
        ) : (
          <StatusBadge status={incident.status} />
        )}
        <span className={cn('min-w-0 flex-1 truncate', isOpen ? 'font-semibold' : 'font-medium text-soft-foreground')}>
          {incident.subject}
        </span>
        <span className={cn('text-xs whitespace-nowrap', incident.owner ? 'text-foreground' : 'text-muted-foreground')}>
          {formatOwner(incident.owner)}
        </span>
      </div>
      <span className={cn('font-medium', !isOpen && 'text-soft-foreground')}>{incident.title}</span>
      <span className="flex flex-wrap gap-x-1.5 text-xs text-soft-foreground">
        {reason && (
          <>
            <span className={cn(isOpen && 'text-foreground')}>{reason}</span>
            <span aria-hidden>·</span>
          </>
        )}
        <span>{contactsWaiting}</span>
      </span>
    </button>
  )
}
