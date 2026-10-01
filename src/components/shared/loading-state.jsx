import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Busy indicator for an area that is still loading.
 *
 * `role="status"` with `aria-live="polite"` announces the change to screen
 * readers without interrupting what the user is doing.
 */
export function LoadingState({ label = 'Loading…', className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col gap-3 py-12', className)}
    >
      <span className="sr-only">{label}</span>
      <Skeleton className="h-6 w-48" aria-hidden="true" />
      <Skeleton className="h-4 w-full max-w-md" aria-hidden="true" />
      <Skeleton className="h-4 w-full max-w-sm" aria-hidden="true" />
    </div>
  )
}

/** Placeholder grid matching the compact product-card layout. */
export function ProductGridSkeleton({ count = 8, className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      <span className="sr-only">Loading products…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-2" aria-hidden="true">
          <Skeleton className="aspect-square w-full rounded-card" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
