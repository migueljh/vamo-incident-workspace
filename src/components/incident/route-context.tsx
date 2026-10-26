import { useState } from 'react'
import { Panel } from '@/components/ds/panel'
import { ProgressBar } from '@/components/ds/progress-bar'
import { SectionLabel } from '@/components/ds/section-label'
import { Button } from '@/components/ui/button'
import { getPendingStops, getStopProgress } from '@/domain/route'
import { formatEt, formatRelative } from '@/domain/time'
import type { Route } from '@/domain/types'
import { cn } from '@/lib/utils'
import { PendingStopRow } from './pending-stop-row'

const VISIBLE_STOPS = 3

interface RouteContextProps {
  route: Route
  className?: string
}

/** Driver status, progress and the next pending stops. Only shown for routes with stop detail. */
export function RouteContext({ route, className }: RouteContextProps) {
  const [showAllStops, setShowAllStops] = useState(false)

  const progress = getStopProgress(route)
  const pendingStops = getPendingStops(route)
  const hiddenStops = pendingStops.length - VISIBLE_STOPS
  const ping = route.lastAppPing

  return (
    <section aria-label="Route context" className={cn('flex flex-col gap-3', className)}>
      <h3 className="text-base font-semibold">Route context</h3>

      {route.driver && (
        <Panel className="gap-1 px-3 py-2.5">
          <SectionLabel>Driver</SectionLabel>
          <span className="font-semibold">{route.driver.name}</span>
          {route.lastLocationAt && (
            <span className="text-soft-foreground">
              Last location {formatRelative(route.lastLocationAt)} ·{' '}
              <span className="font-mono text-xs">{formatEt(route.lastLocationAt)}</span>
            </span>
          )}
          {ping && (
            <span className={ping.responded ? 'text-soft-foreground' : 'text-critical-strong'}>
              Last app ping {formatRelative(ping.at)} · <span className="font-mono text-xs">{formatEt(ping.at)}</span>
              {ping.responded ? ' · responded' : ' · no response'}
            </span>
          )}
        </Panel>
      )}

      <Panel className="gap-1.5 px-3 py-2.5">
        <SectionLabel>Progress</SectionLabel>
        <span className="font-semibold">
          {progress.delivered} of {progress.total} stops delivered · {progress.pending} pending
        </span>
        <ProgressBar value={progress.delivered} max={progress.total} label="Stops delivered" />
      </Panel>

      {pendingStops.length > 0 && (
        <Panel>
          <div className="border-b px-3 py-2">
            <SectionLabel>Next pending stops</SectionLabel>
          </div>
          <ul>
            {pendingStops.slice(0, showAllStops ? undefined : VISIBLE_STOPS).map((stop) => (
              <PendingStopRow key={stop.id} stop={stop} />
            ))}
          </ul>
          {hiddenStops > 0 && (
            <div className="px-1.5 py-1">
              <Button
                variant="link"
                size="xs"
                aria-expanded={showAllStops}
                onClick={() => setShowAllStops((shown) => !shown)}
                className="text-foreground underline underline-offset-2"
              >
                {showAllStops ? 'Show less' : `+${hiddenStops} more stops`}
              </Button>
            </div>
          )}
        </Panel>
      )}
    </section>
  )
}
