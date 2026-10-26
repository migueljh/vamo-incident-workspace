import { Inbox } from 'lucide-react'

export function EmptyPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <Inbox aria-hidden className="size-6 text-muted-foreground" />
      <p className="font-semibold">No incident selected</p>
      <p className="text-soft-foreground">Pick an incident from the queue to see its timeline and next step.</p>
    </div>
  )
}
