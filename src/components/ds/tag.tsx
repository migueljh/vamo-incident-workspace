import { cn } from '@/lib/utils'
import { getChannelLabel, getSourceLabel, getSourceTagClasses } from '@/domain/constants'
import type { TimelineChannel, TimelineSource } from '@/domain/types'

type TagProps = { kind: 'source'; source: TimelineSource } | { kind: 'channel'; channel: TimelineChannel }

/** Small label for a timeline event's source (filled) or channel (outlined). */
export function Tag(props: TagProps) {
  if (props.kind === 'source') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-sm px-1.5 py-0.75 text-2xs leading-none font-semibold whitespace-nowrap',
          getSourceTagClasses(props.source),
        )}
      >
        {getSourceLabel(props.source)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-sm border border-input px-1.5 py-0.5 text-2xs leading-none font-medium whitespace-nowrap text-soft-foreground">
      {getChannelLabel(props.channel)}
    </span>
  )
}
