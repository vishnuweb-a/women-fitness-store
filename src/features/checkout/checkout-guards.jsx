import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DemoNotice } from '@/features/checkout/checkout-layout'

/**
 * The screen shown when a checkout step cannot be entered.
 *
 * Deliberately **not** a redirect. Bouncing someone to `/cart` with no
 * explanation is the worst version of this: a reload, a bookmark, or a shared
 * link all land here legitimately, and silently moving the page leaves them
 * guessing what happened. The reason is stated and a route onward is offered.
 *
 * The heading takes focus on mount, so a keyboard or screen-reader user is
 * placed at the explanation rather than at the top of a page whose content
 * just changed underneath them.
 */
export function CheckoutBlocked({ title, reason, primaryTo, primaryLabel }) {
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="container-site py-10 sm:py-14">
      <div className="mx-auto max-w-xl">
        <DemoNotice />
        <div className="mt-6 flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-12 text-center">
          <ShoppingBag className="size-8 text-muted-foreground" aria-hidden="true" focusable="false" />
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl font-extrabold tracking-tight outline-none"
          >
            {title}
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground text-pretty">{reason}</p>
          <Button asChild className="mt-2">
            <Link to={primaryTo}>{primaryLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Banner shown when the bag changed while checkout was open.
 *
 * The summary beside it has already refreshed — it is derived from the live
 * cart on every render — so this is about consent, not staleness of display:
 * completion stays blocked until the updated items have been looked at and
 * confirmed. `role="alert"` because it interrupts a flow the person believed
 * was settled.
 */
export function CartChangedNotice({ onAcknowledge, acknowledgeLabel = 'Review updated items' }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-card border border-warning/50 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex gap-2 text-sm text-ink-900">
        <TriangleAlert
          className="mt-0.5 size-4 shrink-0 text-warning"
          aria-hidden="true"
          focusable="false"
        />
        <span className="text-pretty">
          Your bag changed while checkout was open. The summary has been updated —
          confirm the new items before completing the demo checkout.
        </span>
      </p>
      <Button type="button" variant="outline" onClick={onAcknowledge} className="shrink-0">
        {acknowledgeLabel}
      </Button>
    </div>
  )
}

/**
 * Warning for cart lines whose product is no longer in the catalog.
 *
 * Checkout does not proceed past these silently: they cannot be priced, so a
 * demo checkout that included them would be reporting items it knows nothing
 * about. The valid lines are untouched — the route back is to the cart, where
 * the unavailable lines can be removed individually.
 */
export function UnavailableLinesNotice({ count }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-card border border-warning/50 bg-warning/10 p-4"
    >
      <p className="flex gap-2 text-sm text-ink-900">
        <TriangleAlert
          className="mt-0.5 size-4 shrink-0 text-warning"
          aria-hidden="true"
          focusable="false"
        />
        <span className="text-pretty">
          {count} {count === 1 ? 'item in your bag is' : 'items in your bag are'} no
          longer in the catalog and cannot be priced. Remove{' '}
          {count === 1 ? 'it' : 'them'} in your bag to continue. Everything else in
          your bag is kept.
        </span>
      </p>
      <Button asChild variant="outline" className="self-start">
        <Link to="/cart">Go to your bag</Link>
      </Button>
    </div>
  )
}
