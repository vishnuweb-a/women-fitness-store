import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Build a compact page list: always the first and last page, the current page
 * and its neighbours, and an ellipsis marker for the gaps.
 *
 * Returns numbers and the string `'gap'`, so the renderer can tell a page from
 * a separator without a sentinel number.
 */
function pageItems(page, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const items = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)

  if (start > 2) items.push('gap')
  for (let n = start; n <= end; n += 1) items.push(n)
  if (end < pageCount - 1) items.push('gap')
  items.push(pageCount)

  return items
}

/**
 * Listing pagination.
 *
 * Rendered as buttons rather than links because the page lives in a search
 * param that the parent writes through the router — the parent decides whether
 * a page change pushes or replaces history. Previous/Next are disabled at the
 * ends rather than hidden, so the control does not reflow as you page through.
 */
export function Pagination({ page, pageCount, onPageChange, className }) {
  if (pageCount <= 1) return null

  const items = pageItems(page, pageCount)

  return (
    <nav aria-label="Pagination" className={cn('flex justify-center', className)}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Go to previous page"
            className="inline-flex size-11 items-center justify-center rounded-control border border-border text-ink-700 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" focusable="false" />
          </button>
        </li>

        {items.map((item, index) =>
          item === 'gap' ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="inline-flex size-11 items-center justify-center text-sm text-muted-foreground"
            >
              &hellip;
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Go to page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'inline-flex size-11 items-center justify-center rounded-control border text-sm tabular-nums transition-colors',
                  item === page
                    ? 'border-brand-500 bg-brand-500 font-semibold text-white'
                    : 'border-border text-ink-700 hover:bg-muted',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Go to next page"
            className="inline-flex size-11 items-center justify-center rounded-control border border-border text-ink-700 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" aria-hidden="true" focusable="false" />
          </button>
        </li>
      </ul>
    </nav>
  )
}
