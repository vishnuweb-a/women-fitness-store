import { PackageOpen } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Nothing-to-show placeholder.
 *
 * `action` takes a real link or button so the empty state stays actionable.
 */
export function EmptyState({
  title = 'Nothing here yet',
  description,
  icon: Icon = PackageOpen,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-16 text-center',
        className,
      )}
    >
      <Icon
        className="size-8 text-muted-foreground"
        aria-hidden="true"
        focusable="false"
      />
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  )
}
