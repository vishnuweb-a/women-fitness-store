/**
 * Shared shell for the customer pages.
 *
 * ## What this is not
 *
 * There is no authentication in this build — no sign-in, no session, no
 * identity. So this shell shows no avatar, no "Signed in as", no membership
 * tier, no reward points, and no order count. Each of those is a claim about
 * a person the application has never met.
 *
 * ## Navigation
 *
 * One `nav` element holds the links, laid out as a sidebar from `lg:` up and
 * as a horizontal scroller below it. Both render the same markup, so there is
 * one tab sequence and one `aria-current="page"` rather than two copies of
 * the navigation competing in the accessibility tree.
 */
import { Info } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { PageMeta } from '@/components/shared/page-meta'

import {
  CUSTOMER_NAV,
  CUSTOMER_NOTICE,
} from '@/features/customer/customer-nav'
import { cn } from '@/lib/utils'

function customerNavClass({ isActive }) {
  return cn(
    'inline-flex min-h-11 w-full items-center gap-2.5 whitespace-nowrap rounded-control px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-ink-700 hover:bg-muted hover:text-brand-600',
  )
}

/**
 * The customer navigation.
 *
 * `aria-current="page"` comes from `NavLink` itself, so the current section is
 * announced rather than only shown in colour. `end` is set on the hub so it is
 * not marked current on every nested route.
 */
export function CustomerNav({ className }) {
  return (
    <nav aria-label="Customer pages" className={cn('min-w-0', className)}>
      <ul
        className={cn(
          // Mobile: one scrollable row. `min-w-0` on the parent keeps the
          // scroller from widening the document — the Phase 2 overflow bug.
          'flex gap-1 overflow-x-auto pb-1',
          // Desktop: a stacked sidebar.
          'lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0',
        )}
      >
        {CUSTOMER_NAV.map((item) => (
          <li key={item.to} className="shrink-0 lg:shrink lg:w-full">
            <NavLink to={item.to} end={item.end} className={customerNavClass}>
              <item.icon className="size-4 shrink-0" aria-hidden="true" focusable="false" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** The persistent session-only notice. */
export function SessionNotice({ className, children = CUSTOMER_NOTICE }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-card border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-ink-800',
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" focusable="false" />
      <span className="text-pretty">{children}</span>
    </p>
  )
}

/**
 * Page wrapper for every customer route.
 *
 * Renders the one `h1` for the page, so these pages keep the same heading
 * contract as `PageShell` without nesting a second container inside the
 * sidebar grid.
 */
export function CustomerLayout({ title, description, children, notice = true }) {
  return (
    <div className="container-site py-8 sm:py-10">
      {/* Session-only demo state — kept out of search results. */}
      <PageMeta title={title} description={description} noIndex />
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
        <CustomerNav className="lg:sticky lg:top-24 lg:h-fit" />

        {/* A plain div, not `main`: `RootLayout` renders the page's one
            `main` landmark already. */}
        <div className="min-w-0">
          <header className="max-w-prose">
            <h1 className="font-display text-display-sm font-extrabold uppercase tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-muted-foreground text-pretty">{description}</p>
            )}
          </header>

          {notice && <SessionNotice className="mt-6" />}

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}