import { cn } from '@/lib/utils'
import { formatEt, formatRelative, NOW } from '@/domain/time'

interface TimeStampProps {
  at: string
  now?: string
  className?: string
}

/** Relative time first, ET time underneath. */
export function TimeStamp({ at, now = NOW, className }: TimeStampProps) {
  return (
    <time dateTime={at} className={cn('flex flex-col items-end whitespace-nowrap', className)}>
      <span className="font-medium">{formatRelative(at, now)}</span>
      <span className="font-mono text-2xs text-muted-foreground">{formatEt(at)}</span>
    </time>
  )
}
