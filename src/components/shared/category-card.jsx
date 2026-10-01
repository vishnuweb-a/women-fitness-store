import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

/**
 * Circular category shortcut, as in the reference's category rail.
 *
 * A single link wraps the whole tile — there is nothing else interactive
 * inside it, so nesting is not a concern here.
 */
export function CategoryCard({ category, className }) {
  return (
    <Link
      to={`/collections/${category.slug}`}
      className={cn(
        'group flex w-20 shrink-0 flex-col items-center gap-2 text-center sm:w-24',
        className,
      )}
    >
      {/* The banner art is the clearest visual shorthand for each category —
          a single scraped product photo reads as one product, not a group. */}
      <span className="relative grid size-16 place-items-center overflow-hidden rounded-full border-2 border-border bg-ink-950 transition-colors group-hover:border-brand-400 sm:size-20">
        {category.banner ? (
          <img
            src={category.banner}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 ease-athletic group-hover:scale-110"
          />
        ) : null}
      </span>
      <span className="text-xs font-medium leading-tight text-ink-800 transition-colors group-hover:text-brand-600 sm:text-sm">
        {category.label}
      </span>
    </Link>
  )
}
