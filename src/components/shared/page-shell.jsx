import { PageMeta } from '@/components/shared/page-meta'
import { cn } from '@/lib/utils'

/**
 * Standard page wrapper: a container, vertical rhythm, and an `h1`.
 *
 * Every route renders exactly one `h1` through this component, which keeps the
 * heading order predictable for screen readers.
 */
export function PageShell({
  title,
  description,
  children,
  className,
  metaTitle = title,
  metaDescription = description,
  noIndex = false,
}) {
  return (
    <div className={cn('container-site py-section', className)}>
      <PageMeta title={metaTitle} description={metaDescription} noIndex={noIndex} />
      <header className="max-w-prose">
        <h1 className="font-display text-display-sm font-extrabold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-muted-foreground">{description}</p>
        )}
      </header>
      {children && <div className="mt-8">{children}</div>}
    </div>
  )
}

/**
 * Marker for a route that exists but has no implementation yet.
 * Keeps Phase 0 honest: the shell routes, it does not transact.
 */
export function PhasePlaceholder({ children = 'Planned for a later phase.' }) {
  return (
    <p className="rounded-card border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
      {children}
    </p>
  )
}
