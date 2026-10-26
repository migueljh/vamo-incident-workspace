import { useEffect, useRef, useState } from 'react'
import type { TimelineEvent } from '@/domain/types'
import { TimelineItem } from './timeline-item'

interface TimelineProps {
  events: TimelineEvent[]
}

export function Timeline({ events }: TimelineProps) {
  // Events present when the incident opened don't animate; ones added after do.
  const [initialCount] = useState(events.length)

  const endRef = useRef<HTMLLIElement>(null)
  const countRef = useRef(events.length)

  // Bring new events (agent actions) into view; leave the initial position alone.
  useEffect(() => {
    if (events.length > countRef.current) endRef.current?.scrollIntoView({ block: 'nearest' })
    countRef.current = events.length
  }, [events.length])

  return (
    <section aria-labelledby="timeline-heading">
      <div className="flex items-baseline gap-2 px-5 pt-3.5 pb-1.5">
        <h3 id="timeline-heading" className="text-base font-semibold">
          Timeline
        </h3>
        <span className="text-muted-foreground">Oldest first</span>
      </div>
      <ol className="px-5 py-1.5">
        {events.map((event, index) => (
          <li key={event.id} ref={index === events.length - 1 ? endRef : undefined}>
            <TimelineItem event={event} isLast={index === events.length - 1} isNew={index >= initialCount} />
          </li>
        ))}
      </ol>
    </section>
  )
}
