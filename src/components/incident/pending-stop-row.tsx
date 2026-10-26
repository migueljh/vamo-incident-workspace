import { getLateMinutes } from '@/domain/route'
import { formatEt, formatEtWindow } from '@/domain/time'
import type { Stop } from '@/domain/types'
import { cn } from '@/lib/utils'

interface PendingStopRowProps {
  stop: Stop
}

export function PendingStopRow({ stop }: PendingStopRowProps) {
  const lateMinutes = getLateMinutes(stop)

  return (
    <li className="flex flex-col gap-0.5 border-b border-line-soft px-3 py-2.25">
      <span className="font-semibold">
        Stop {stop.number} · {stop.customerName}
      </span>
      <span className="text-xs text-soft-foreground">
        Window <span className="font-mono">{formatEtWindow(stop.windowStart, stop.windowEnd)}</span>
      </span>
      {/* Lateness is spelled out, not just colored. */}
      <span className={cn('text-xs', lateMinutes > 0 && 'font-semibold text-critical-strong')}>
        ETA {formatEt(stop.eta)} · {lateMinutes > 0 ? `Late ${lateMinutes} min` : 'On time'}
      </span>
    </li>
  )
}
