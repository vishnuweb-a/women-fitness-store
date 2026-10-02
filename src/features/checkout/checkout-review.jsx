import { useEffect, useRef } from 'react'
import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ProductImage } from '@/components/shared/product-image'
import { Button } from '@/components/ui/button'
import { AddressSummary } from '@/features/checkout/address-summary'
import { getPaymentMethodLabel } from '@/features/checkout/checkout-schema'
import { formatPrice } from '@/services/catalog'

/**
 * Final review before completing the demo checkout.
 *
 * Every number is recomputed from the live, catalog-derived cart in integer
 * paise — never read back from a copy taken at an earlier step — so a price or
 * quantity that changed while checkout was open is reflected here. When the
 * cart changes, `blocked` is set and the parent sends the person back to the
 * form, so completion can never run against items nobody has seen.
 *
 * **No payable grand total.** Shipping and tax cannot be calculated in this
 * build, so merchandise subtotal is the only figure stated and the rest is
 * named as pending.
 *
 * Focus moves to the heading on mount, so the step change is not silent for a
 * keyboard or screen-reader user. It is done here rather than from the parent
 * because `AnimatePresence mode="wait"` unmounts the form before mounting this
 * — a parent effect keyed on the mode flag runs while this subtree does not
 * yet exist, and focus silently stays on `body`.
 */
export function CheckoutReview({
  items,
  count,
  subtotalPaise,
  delivery,
  billingAddress,
  paymentMethod,
  blocked,
  onBack,
  onComplete,
}) {
  const methodLabel = getPaymentMethodLabel(paymentMethod)
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section aria-labelledby="demo-review-heading" className="flex flex-col gap-6">
      <h2
        ref={headingRef}
        id="demo-review-heading"
        tabIndex={-1}
        className="font-display text-lg font-bold uppercase tracking-tight outline-none"
      >
        Review before completing
      </h2>

      <section aria-labelledby="review-items" className="rounded-card border border-border p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="review-items" className="text-sm font-semibold uppercase tracking-wide">
            Items{' '}
            <span className="font-normal tabular-nums text-muted-foreground">({count})</span>
          </h3>
          <Button asChild variant="link" size="sm" className="h-auto p-0">
            {/* A router Link, not an anchor: a full page load would discard
                the in-memory checkout draft along with the page. */}
            <Link to="/cart">
              Edit<span className="sr-only"> items in your bag</span>
            </Link>
          </Button>
        </div>

        <ul className="mt-3 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.key} className="flex gap-3">
              <span className="size-16 shrink-0 overflow-hidden rounded-control bg-muted sm:size-20">
                <ProductImage
                  image={item.product.primaryImage}
                  sizes="80px"
                  className="size-full object-contain"
                />
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                {item.product.brand && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.product.brand}
                  </span>
                )}
                <span className="text-sm font-medium leading-snug text-pretty">
                  {item.product.name}
                </span>
                {(item.line.color || item.line.size) && (
                  <span className="text-xs text-muted-foreground">
                    {[
                      item.line.color && `Colour: ${item.line.color}`,
                      item.line.size && `Size: ${item.line.size}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                )}
                <span className="text-xs tabular-nums text-muted-foreground">
                  Quantity {item.quantity} ×{' '}
                  {formatPrice(item.unitPaise, item.product.currency)}
                </span>
              </span>

              <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
                {formatPrice(item.subtotalPaise, item.product.currency)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-medium">Merchandise subtotal</dt>
            <dd className="font-semibold tabular-nums text-ink-950">
              {formatPrice(subtotalPaise)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="text-muted-foreground">Not calculated</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Taxes</dt>
            <dd className="text-muted-foreground">Not calculated</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <AddressSummary
          heading="Contact and delivery"
          headingId="review-delivery"
          address={delivery}
          contact={{ email: delivery.email, phone: delivery.phone }}
          editTo="/checkout"
          editLabel="delivery and contact details"
          as="h3"
        />
        <AddressSummary
          heading="Billing address"
          headingId="review-billing"
          address={billingAddress}
          as="h3"
        />
      </div>

      <section
        aria-labelledby="review-method"
        className="rounded-card border border-border p-4"
      >
        <h3 id="review-method" className="text-sm font-semibold uppercase tracking-wide">
          Demo payment method
        </h3>
        <p className="mt-2 text-sm text-ink-800">{methodLabel ?? 'Not selected'}</p>
        <p className="mt-1 text-xs text-muted-foreground text-pretty">
          Recorded as a preference only. No payment provider is integrated and no
          payment details were collected.
        </p>
      </section>

      <p className="flex gap-2 rounded-card border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" focusable="false" />
        <span className="text-pretty">
          No payable total is shown. A final amount needs backend pricing, shipping
          calculation, tax rules, and inventory verification — none of which exist in
          this build. Completing this checkout records a frontend-only demo
          reference; it creates no order and takes no payment.
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="lg" className="min-h-11" onClick={onComplete} disabled={blocked}>
          Complete demo checkout
        </Button>
        <Button type="button" variant="outline" size="lg" className="min-h-11" onClick={onBack}>
          Back to billing and payment
        </Button>
      </div>
    </section>
  )
}
