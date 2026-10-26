import { AppHeader } from '@/components/app-header'
import { Queue } from '@/components/queue/queue'
import { WorkspaceProvider } from '@/state/workspace-provider'

function App() {
  return (
    <WorkspaceProvider>
      <div className="flex h-svh flex-col overflow-hidden">
        <AppHeader />
        <div className="flex min-h-0 flex-1">
          <Queue />
          <main className="min-w-0 flex-1 bg-card" />
        </div>
      </div>
    </WorkspaceProvider>
  )
}

export default App
