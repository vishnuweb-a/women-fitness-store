import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Breadcrumb trail.
 *
 * A real `<nav>` with an ordered list, because the order is meaningful. The
 * last entry is the current page: it is not a link, and it carries
 * `aria-current="page"` so assistive technology announces it as the location
 * rather than as a destination.
 *
 * `items` is `[{ label, to }]`; omit `to` on the final entry.
 */
export function Breadcrumbs({ items, className }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="size-3.5 shrink-0 text-ink-400"
                  aria-hidden="true"
                  focusable="false"
                />
              )}
              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="truncate font-medium text-ink-800"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="truncate rounded-sm hover:text-brand-600 hover:underline underline-offset-2"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
