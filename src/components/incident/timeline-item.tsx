import { Check } from 'lucide-react'
import { Tag } from '@/components/ds/tag'
import { TimeStamp } from '@/components/ds/time-stamp'
import { getSourceDotClasses } from '@/domain/constants'
import type { TimelineEvent } from '@/domain/types'
import { cn } from '@/lib/utils'

interface TimelineItemProps {
  event: TimelineEvent
  isLast: boolean
}

export function TimelineItem({ event, isLast }: TimelineItemProps) {
  return (
    <div className="grid grid-cols-[6rem_0.75rem_minmax(0,1fr)] gap-x-3">
      <TimeStamp at={event.at} className="pt-px" />
      <div aria-hidden className="flex flex-col items-center pt-1.25">
        <div className={cn('size-2.25 shrink-0 rounded-full', getSourceDotClasses(event.source))} />
        {!isLast && <div className="mt-0.75 w-px flex-1 bg-border" />}
      </div>
      <div className="flex min-w-0 flex-col gap-0.75 pb-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag kind="source" source={event.source} />
          <Tag kind="channel" channel={event.channel} />
          <span className="font-semibold">{event.title}</span>
          {event.subtitle && <span className="text-xs text-muted-foreground">{event.subtitle}</span>}
          {event.answered && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Check aria-hidden className="size-3" />
              Answered
            </span>
          )}
        </div>
        {event.body && <p className="text-pretty">{event.body}</p>}
      </div>
    </div>
  )
}
