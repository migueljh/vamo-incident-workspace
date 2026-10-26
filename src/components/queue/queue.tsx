import { ScrollArea } from '@/components/ui/scroll-area'
import { sortIncidents } from '@/domain/priority'
import { cn } from '@/lib/utils'
import { actions } from '@/state/actions'
import { useWorkspace } from '@/state/workspace-context'
import { IncidentCard } from './incident-card'

export function Queue() {
  const { state, dispatch } = useWorkspace()

  const { data, selectedIncidentId, panelCollapsed } = state
  const incidents = sortIncidents(data)
  const openCount = data.incidents.filter((incident) => incident.status === 'open').length

  return (
    <aside
      aria-label="Incident queue"
      className={cn(
        'flex min-w-0 flex-col border-r',
        panelCollapsed ? 'flex-1' : 'w-80 shrink-0 xl:w-93',
      )}
    >
      <div className="flex items-baseline gap-2 px-4 pt-3.5 pb-2.5">
        <h2 className="text-base font-semibold">Queue</h2>
        <span className="text-muted-foreground">{openCount} open · sorted by urgency</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul
          className={cn(
            'grid gap-2 px-3 pb-4',
            panelCollapsed && 'grid-cols-[repeat(auto-fill,minmax(25rem,1fr))]',
          )}
        >
          {incidents.map((incident) => (
            <li key={incident.id}>
              <IncidentCard
                incident={incident}
                data={data}
                selected={!panelCollapsed && incident.id === selectedIncidentId}
                onSelect={(incidentId) => dispatch(actions.selectIncident(incidentId))}
              />
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  )
}
