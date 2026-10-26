import { CURRENT_AGENT } from '@/domain/constants'
import { formatEt, NOW } from '@/domain/time'

export function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-card px-5">
      <div className="flex items-center gap-3.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-md font-bold tracking-tight">Vamo</span>
          <span className="font-medium text-muted-foreground">Ops</span>
        </div>
        <div aria-hidden className="h-4.5 w-px bg-border" />
        <h1 className="font-semibold">Incident Workspace</h1>
      </div>
      <div className="flex items-center gap-4.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-muted-foreground">Now</span>
          <time dateTime={NOW} className="font-mono font-medium">
            {formatEt(NOW)}
          </time>
          <span className="rounded-sm bg-tag px-1.5 py-0.5 text-2xs text-tag-foreground">Demo clock</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className="flex size-6.5 items-center justify-center rounded-full bg-primary text-2xs font-semibold text-primary-foreground"
          >
            {CURRENT_AGENT.charAt(0)}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold">{CURRENT_AGENT}</span>
            <span className="text-2xs text-muted-foreground">LatAm shift</span>
          </div>
        </div>
      </div>
    </header>
  )
}
