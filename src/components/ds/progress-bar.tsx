interface ProgressBarProps {
  value: number
  max: number
  label: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1.25 overflow-hidden rounded-full bg-border"
    >
      {/* Width is data-driven, so it's the one inline style. */}
      <div className="h-full bg-foreground" style={{ width: `${percent}%` }} />
    </div>
  )
}
