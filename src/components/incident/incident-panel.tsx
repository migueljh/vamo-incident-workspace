import { useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getIncident, getRoute } from '@/domain/lookup'
import { getSeverity } from '@/domain/priority'
import { hasRouteDetail } from '@/domain/route'
import { getTimeline } from '@/domain/timeline'
import type { Incident } from '@/domain/types'
import { actions } from '@/state/actions'
import { useWorkspace } from '@/state/workspace-context'
import { CollapsedRail } from './collapsed-rail'
import { Composer, type ComposerHandle } from './composer'
import { EmptyPanel } from './empty-panel'
import { IncidentHeader } from './incident-header'
import { NextStepCard } from './next-step-card'
import { RouteContext } from './route-context'
import { Timeline } from './timeline'

export function IncidentPanel() {
  const { state, dispatch } = useWorkspace()

  const incident = getIncident(state.data, state.selectedIncidentId)

  if (state.panelCollapsed) {
    return (
      <CollapsedRail
        incident={incident}
        severity={incident && getSeverity(incident, state.data)}
        onExpand={() => dispatch(actions.togglePanel())}
      />
    )
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-card">
      {incident ? <IncidentView key={incident.id} incident={incident} /> : <EmptyPanel />}
    </main>
  )
}

interface IncidentViewProps {
  incident: Incident
}

function IncidentView({ incident }: IncidentViewProps) {
  const { state, dispatch } = useWorkspace()

  const composerRef = useRef<ComposerHandle>(null)

  const { data } = state
  const route = getRoute(data, incident.routeId)
  const showRoute = hasRouteDetail(route)
  // Unknown numbers can't be acted on until they're linked to an order.
  const canAct = getSeverity(incident, data) !== 'needs_linking'

  return (
    <>
      <IncidentHeader incident={incident} data={data} onCollapse={() => dispatch(actions.togglePanel())} />
      <NextStepCard nextStep={incident.nextStep} owner={incident.owner} canAssign={canAct} />
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1">
            <Timeline events={getTimeline(incident, data)} />
            {/* Below 1280px the route context moves under the timeline. */}
            {showRoute && <RouteContext route={route} className="mx-5 mb-4.5 border-t border-line-soft pt-3.5 xl:hidden" />}
          </ScrollArea>
          {incident.replyTemplate !== undefined && <Composer ref={composerRef} incident={incident} data={data} />}
        </div>
        {showRoute && (
          <ScrollArea className="hidden w-85 shrink-0 border-l border-line-soft bg-surface-rail xl:block">
            <RouteContext route={route} className="px-4 py-3.5" />
          </ScrollArea>
        )}
      </div>
    </>
  )
}
