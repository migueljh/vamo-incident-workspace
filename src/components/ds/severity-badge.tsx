import { cn } from '@/lib/utils'
import { getSeverityClasses, getSeverityLabel } from '@/domain/constants'
import type { Severity } from '@/domain/types'

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

/** Severity as color plus a text label, never color alone. */
export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-sm border px-1.5 py-0.75 text-2xs leading-none font-semibold whitespace-nowrap',
        getSeverityClasses(severity),
        className,
      )}
    >
      {getSeverityLabel(severity)}
    </span>
  )
}
