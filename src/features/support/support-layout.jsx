/**
 * Shared shell and status banner for the help and policy pages.
 *
 * ## Policy status is on the page, not in a footnote
 *
 * The shipping, returns, privacy, terms, and disclaimer pages describe
 * commercial and legal positions that have not been finalised. Presenting them as settled would
 * be inventing terms a customer could reasonably rely on, so each page opens
 * with a visible status banner naming what it is: a draft, or a placeholder
 * awaiting the merchant's confirmation.
 */
import { FileClock, Info, TriangleAlert } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { CompanyContact } from '@/components/shared/company-contact'
import { PageMeta } from '@/components/shared/page-meta'
import { SUPPORT_NAV } from '@/features/support/support-nav'
import { COMPANY_INFO } from '@/lib/company-info'
import { cn } from '@/lib/utils'

function supportNavClass({ isActive }) {
  return cn(
    'inline-flex min-h-11 w-full items-center whitespace-nowrap rounded-control px-3 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-muted hover:text-brand-600',
  )
}

/**
 * Status banner for a page whose content is not final.
 *
 * `tone` picks the wording's weight: `draft` for text that exists but is
 * unreviewed, `pending` for a policy that has not been set at all.
 */
export function PolicyStatus({ tone = 'draft', children, className }) {
  const pending = tone === 'pending'
  const Icon = pending ? TriangleAlert : FileClock

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-card border px-4 py-3 text-sm',
        pending
          ? 'border-warning/50 bg-warning/10 text-ink-900'
          : 'border-brand-200 bg-brand-50 text-ink-800',
        className,
      )}
    >
      <Icon
        className={cn('mt-0.5 size-4 shrink-0', pending ? 'text-warning' : 'text-brand-600')}
        aria-hidden="true"
        focusable="false"
      />
      <p className="text-pretty">
        <strong className="font-semibold">
          {pending ? 'Not set yet. ' : 'Draft for review. '}
        </strong>
        {children}
      </p>
    </div>
  )
}

/** A plain informational note. */
export function SupportNote({ children, className }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-card border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground',
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" focusable="false" />
      <span className="text-pretty">{children}</span>
    </p>
  )
}

/** A titled content block, used throughout the support pages. */
export function SupportSection({ id, title, children, className }) {
  return (
    <section aria-labelledby={id} className={cn('mt-8', className)}>
      <h2 id={id} className="font-display text-xl font-bold tracking-tight">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-ink-800">
        {children}
      </div>
    </section>
  )
}

/**
 * Page wrapper for every support route.
 *
 * Mirrors the customer layout: one `nav`, one `h1`, a sidebar from `lg:` up
 * and a horizontal scroller below it, and a readable measure for prose.
 *
 * Every support and policy page ends with the operating company's contact
 * details, rendered here once rather than repeated in each page. The contact
 * page sets `showCompanyContact={false}` because it leads with the same
 * details, and showing them twice on one page is noise.
 */
export function SupportLayout({
  title,
  description,
  status,
  showCompanyContact = true,
  children,
}) {
  return (
    <div className="container-site py-8 sm:py-10">
      <PageMeta title={title} description={description} />
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
        <nav aria-label="Help and support" className="min-w-0 lg:sticky lg:top-24 lg:h-fit">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
            {SUPPORT_NAV.map((item) => (
              <li key={item.to} className="shrink-0 lg:w-full lg:shrink">
                <NavLink to={item.to} className={supportNavClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* A plain div, not `main`: `RootLayout` renders the one `main`. */}
        <div className="min-w-0 max-w-prose">
          <header>
            <h1 className="font-display text-display-sm font-extrabold uppercase tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-muted-foreground text-pretty">{description}</p>
            )}
          </header>

          {status && <div className="mt-6">{status}</div>}

          {children}

          {showCompanyContact && (
            <section
              aria-labelledby="support-company"
              className="mt-10 border-t border-border pt-6"
            >
              <h2 id="support-company" className="font-display text-xl font-bold tracking-tight">
                Company information
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-800 text-pretty">
                This website is operated by {COMPANY_INFO.legalName}. Something here
                unclear or wrong? Get in touch using the details below, or see the{' '}
                <Link to="/contact" className="font-medium text-brand-600 hover:underline">
                  contact page
                </Link>
                .
              </p>
              <CompanyContact className="mt-4" />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
