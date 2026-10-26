import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: ReactNode
  id?: string
  className?: string
}

/** Small uppercase mono label: "NEXT STEP", "DRIVER". */
export function SectionLabel({ children, id, className }: SectionLabelProps) {
  return (
    <span
      id={id}
      className={cn('font-mono text-2xs tracking-label text-muted-foreground uppercase', className)}
    >
      {children}
    </span>
  )
}
