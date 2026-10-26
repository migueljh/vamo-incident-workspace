import { cn } from '@/lib/utils'
import { getStatusClasses, getStatusLabel } from '@/domain/constants'
import type { IncidentStatus } from '@/domain/types'

interface StatusBadgeProps {
  status: IncidentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-sm border px-1.5 py-0.75 text-2xs leading-none font-medium whitespace-nowrap',
        getStatusClasses(status),
        className,
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}
