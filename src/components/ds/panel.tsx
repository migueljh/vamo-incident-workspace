import type { ComponentProps } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type PanelProps = ComponentProps<typeof Card> & {
  tone?: 'default' | 'subtle'
}

/** Bordered container for next step, driver, progress and stops. */
export function Panel({ tone = 'default', className, ...props }: PanelProps) {
  return (
    <Card
      className={cn(
        'gap-0 rounded-lg border py-0 text-sm shadow-none ring-0',
        tone === 'subtle' ? 'border-input bg-surface-subtle' : 'border-border bg-card',
        className,
      )}
      {...props}
    />
  )
}
