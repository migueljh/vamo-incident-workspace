import { flushSync } from 'react-dom'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Applies a state change inside a View Transition so moved, resized or swapped elements animate.
 * Without the API, or with reduced motion, the change happens instantly.
 */
export function withViewTransition(update: () => void): void {
  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}
