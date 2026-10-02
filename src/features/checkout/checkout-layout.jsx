import { useEffect } from 'react'
import { ArrowLeft, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageMeta } from '@/components/shared/page-meta'
import { CheckoutStepIndicator } from '@/features/checkout/checkout-steps'
import { cn } from '@/lib/utils'

/**
 * The single sentence every checkout surface repeats.
 *
 * It is a constant rather than prose typed per page so the claim cannot drift
 * between steps — this is the one statement the whole flow depends on being
 * accurate.
 */
export const DEMO_NOTICE =
  'Demo checkout — no payment will be taken and no order will be placed.'

/**
 * Shared shell for the checkout steps.
 *
 * Layout follows reference screens 06 and 07: a brand row with a back-to-bag
 * link, the step indicator beneath it, then a two-column body with the form on
 * the left and the order summary on the right.
 *
 * On mobile the summary moves **below** the form rather than above it, so the
 * first thing in the tab order and on screen is the work to be done. A
 * collapsed summary at the top would push the first field below the fold on a
 * 390px screen for no benefit — the totals are unchanged by anything on these
 * pages.
 */
export function CheckoutLayout({ step, title, description, children, summary }) {
  /**
   * Start each step at the top of the page.
   *
   * Without this, moving from delivery to billing keeps the previous scroll
   * offset, and the sticky site header then covers the new step's first row —
   * its heading and the "Back to bag" link are both off-screen and the link is
   * not even clickable, because the header sits over it. Measured, not
   * assumed: submitting step 1 left the page at y=92 with the header's lower
   * edge at 146.
   *
   * Keyed on `step` rather than on the route, so the review mode within the
   * payment step does not re-scroll the page out from under someone who is
   * reading it.
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [step])

  return (
    <div className="container-site py-6 sm:py-8">
      {/* Demonstration checkout — kept out of search results. */}
      <PageMeta title={title} description={description} noIndex />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/cart"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-700 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" focusable="false" />
          Back to bag
        </Link>

        <Link
          to="/"
          className="flex min-h-11 shrink-0 flex-col justify-center leading-none"
          aria-label="FITNEX WOMEN — home"
        >
          <span
            aria-hidden="true"
            className="block font-display text-xl font-extrabold tracking-tight text-ink-950"
          >
            FITNE<span className="text-brand-500">X</span>
          </span>
          <span
            aria-hidden="true"
            className="block text-[0.5rem] font-semibold tracking-[0.42em] text-ink-500"
          >
            WOMEN
          </span>
        </Link>
      </div>

      <CheckoutStepIndicator current={step} className="mt-6 sm:mt-8" />

      <DemoNotice className="mt-6" />

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        {/* A plain div, not `main`: `RootLayout` already renders the page's
            one `main` landmark, and a second would give the document two. */}
        <div className="min-w-0">
          <h1 className="font-display text-display-sm font-extrabold uppercase tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-prose text-sm text-muted-foreground text-pretty">
              {description}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {/* Order first on desktop is unnecessary: the form is already first in
            the DOM, which is the order both the tab sequence and a screen
            reader follow. The summary simply sticks beside it. */}
        <div className="lg:sticky lg:top-6 lg:h-fit">{summary}</div>
      </div>
    </div>
  )
}

/** The persistent demo notice. Rendered on every checkout surface. */
export function DemoNotice({ className }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-card border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-ink-800',
        className,
      )}
    >
      <Info
        className="mt-0.5 size-4 shrink-0 text-brand-600"
        aria-hidden="true"
        focusable="false"
      />
      <span className="text-pretty">{DEMO_NOTICE}</span>
    </p>
  )
}
