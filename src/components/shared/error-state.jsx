import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Inline failure message for a section that could not load. */
export function ErrorState({
  title = 'We could not load this',
  description = 'Something went wrong while fetching this content. Please try again.',
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-card border border-border bg-card px-6 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle
        className="size-8 text-brand-500"
        aria-hidden="true"
        focusable="false"
      />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
