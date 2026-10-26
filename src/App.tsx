import { AppHeader } from '@/components/app-header'
import { IncidentPanel } from '@/components/incident/incident-panel'
import { Queue } from '@/components/queue/queue'
import { WorkspaceProvider } from '@/state/workspace-provider'

function App() {
  return (
    <WorkspaceProvider>
      <div className="flex h-svh flex-col overflow-hidden">
        <AppHeader />
        <div className="flex min-h-0 flex-1">
          <Queue />
          <IncidentPanel />
        </div>
      </div>
    </WorkspaceProvider>
  )
}

export default App
