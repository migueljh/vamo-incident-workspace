import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecipientChipProps {
  name: string
  detail?: string
  selected: boolean
  disabled?: boolean
  onToggle: () => void
}

/** A reply recipient. Click to remove it from the reply, click again to add it back. */
export function RecipientChip({ name, detail, selected, disabled = false, onToggle }: RecipientChipProps) {
  const Icon = selected ? X : Plus
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${name} from the reply` : `Add ${name} back to the reply`}
      className={cn(
        'inline-flex h-6.5 items-center gap-1.5 rounded-full border px-2 text-xs transition-[color,background-color,border-color,box-shadow,scale] duration-(--duration-fast) ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:active:scale-98 disabled:opacity-50',
        selected
          ? 'border-line-strong bg-card text-foreground enabled:hover:bg-muted'
          : 'border-dashed border-line-strong text-muted-foreground line-through enabled:hover:bg-card',
      )}
    >
      <span className="font-medium">{name}</span>
      {detail && <span className="text-muted-foreground">{detail}</span>}
      <Icon aria-hidden className="size-3 text-muted-foreground" />
    </button>
  )
}
