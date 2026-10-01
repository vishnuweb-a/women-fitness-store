import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Section title with an optional subtitle and a "view all" link.
 *
 * The link sits beside the heading rather than wrapping it, so the heading
 * text stays plain and the link is a single, independent target.
 */
export function SectionHeading({
  id,
  title,
  subtitle,
  actionLabel,
  actionTo,
  level: Level = 'h2',
  className,
  tone = 'light',
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <Level
          id={id}
          className={cn(
            'font-display text-2xl font-extrabold uppercase tracking-tight text-balance sm:text-3xl',
            tone === 'dark' ? 'text-white' : 'text-ink-950',
          )}
        >
          {title}
        </Level>
        {subtitle && (
          <p
            className={cn(
              'mt-1 text-sm text-pretty',
              tone === 'dark' ? 'text-ink-300' : 'text-muted-foreground',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className={cn(
            'group inline-flex min-h-11 items-center gap-1 text-sm font-semibold transition-colors',
            tone === 'dark'
              ? 'text-ink-200 hover:text-white'
              : 'text-brand-600 hover:text-brand-700',
          )}
        >
          {actionLabel}
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
            focusable="false"
          />
        </Link>
      )}
    </div>
  )
}
