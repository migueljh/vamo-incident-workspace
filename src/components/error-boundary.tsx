import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Panel } from '@/components/ds/panel'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Catches render errors so the demo shows a calm message instead of a blank screen. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Incident Workspace crashed', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex h-svh items-center justify-center bg-background p-6">
        <Panel role="alert" className="max-w-sm items-start gap-3 px-5 py-4">
          <p className="text-base font-semibold">Something went wrong.</p>
          <p className="text-soft-foreground">Reload to restart the demo. All data is mocked, so nothing is lost.</p>
          <Button size="md" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Panel>
      </div>
    )
  }
}
