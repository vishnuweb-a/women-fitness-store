import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, Info, SearchX } from 'lucide-react'

import { ProductImage } from '@/components/shared/product-image'
import { Button } from '@/components/ui/button'
import { AddressSummary } from '@/features/checkout/address-summary'
import { DemoNotice } from '@/features/checkout/checkout-layout'
import { getPaymentMethodLabel } from '@/features/checkout/checkout-schema'
import { CheckoutStepIndicator } from '@/features/checkout/checkout-steps'
import { useCheckout } from '@/features/checkout/use-checkout'
import { formatPrice } from '@/services/catalog'

/**
 * Demo checkout completion.
 *
 * Reference screen 08 is an order confirmation: "ORDER CONFIRMED", an order
 * number, a total, an estimated delivery window, a four-stage tracking rail,
 * "Track order", and "Download invoice". **None of that exists here**, so none
 * of it is rendered. No order was created, no payment was taken, nothing will
 * ship, and there is no invoice — a tracking rail or a paid badge on this page
 * would be a fabrication about something people act on.
 *
 * What is shown is what actually happened: a frontend-only reference, the
 * items as they were reviewed, the merchandise subtotal, and the recorded
 * method preference, drawn from a frozen in-memory snapshot.
 *
 * The snapshot lives in memory only. A reload, a new tab, or someone else's
 * browser has no snapshot for the id — and the page says so rather than
 * reconstructing an order from the URL, which would mean inventing one.
 */
export function OrderConfirmationPage() {
  const { id } = useParams()
  const { getSnapshot } = useCheckout()
  const reduceMotion = useReducedMotion()
  const headingRef = useRef(null)

  const snapshot = getSnapshot(id)

  useEffect(() => {
    // Arriving from the review step keeps the previous scroll offset, which
    // would land someone partway down the confirmation with the sticky header
    // covering its heading. Focusing the heading alone does not scroll it
    // clear of a sticky element.
    window.scrollTo({ top: 0, behavior: 'instant' })
    headingRef.current?.focus()
  }, [])

  if (!snapshot) {
    return (
      <div className="container-site py-10 sm:py-14">
        <div className="mx-auto max-w-xl">
          <DemoNotice />
          <div className="mt-6 flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-12 text-center">
            <SearchX
              className="size-8 text-muted-foreground"
              aria-hidden="true"
              focusable="false"
            />
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-2xl font-extrabold tracking-tight outline-none"
            >
              Demo session unavailable
            </h1>
            <p className="max-w-prose text-sm text-muted-foreground text-pretty">
              This demo checkout is not available in this browser tab. Demo results
              are held in memory for one session only, so they do not survive a
              reload, a new tab, or a shared link — and no order exists to look up,
              because none was ever placed.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/collections">Continue shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/cart">Return to bag</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const methodLabel = getPaymentMethodLabel(snapshot.paymentMethod)

  return (
    <div className="container-site py-6 sm:py-8">
      <CheckoutStepIndicator current="confirmation" />

      <div className="mx-auto mt-8 max-w-3xl">
        <DemoNotice />

        <motion.div
          initial={reduceMotion ? false : { y: 8 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-col items-center gap-3 text-center"
        >
          <CheckCircle2
            className="size-12 text-success"
            aria-hidden="true"
            focusable="false"
          />
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-display-sm font-extrabold uppercase tracking-tight outline-none"
          >
            Demo checkout complete
          </h1>
          {/*
            The single most important sentence on this page. It is not a
            footnote or a tooltip — someone who reads only the heading and one
            line must still come away correct about what happened.
          */}
          <p className="max-w-prose text-base font-medium text-ink-900 text-pretty">
            No order was placed and no payment was taken.
          </p>
          <p className="max-w-prose text-sm text-muted-foreground text-pretty">
            Your bag has not been emptied, nothing is reserved, and nothing will be
            shipped. This page exists to show what the flow looks like once a
            backend and a payment provider are connected.
          </p>
        </motion.div>

        <dl className="mt-8 grid gap-4 rounded-card border border-border bg-muted/60 p-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demo reference
            </dt>
            <dd className="mt-1 break-all font-mono text-sm font-semibold text-ink-950">
              {snapshot.reference}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Completed
            </dt>
            <dd className="mt-1 text-sm text-ink-950">
              <time dateTime={snapshot.createdAt}>
                {new Date(snapshot.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Merchandise subtotal
            </dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums text-ink-950">
              {formatPrice(snapshot.merchandiseSubtotalPaise)}
            </dd>
          </div>
        </dl>

        <p className="mt-2 text-xs text-muted-foreground text-pretty">
          The reference is generated in this browser. It is not an order number and
          nothing can be looked up with it.
        </p>

        <section aria-labelledby="demo-items" className="mt-8">
          <h2
            id="demo-items"
            className="font-display text-lg font-bold uppercase tracking-tight"
          >
            Items reviewed{' '}
            <span className="font-sans text-sm font-normal tabular-nums text-muted-foreground">
              ({snapshot.itemCount})
            </span>
          </h2>

          <ul className="mt-4 flex flex-col gap-4">
            {snapshot.items.map((item) => (
              <li
                key={item.key}
                className="flex gap-3 rounded-card border border-border p-3 sm:p-4"
              >
                <span className="size-16 shrink-0 overflow-hidden rounded-control bg-muted sm:size-20">
                  <ProductImage image={item.image} sizes="80px" className="size-full object-contain" />
                </span>

                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {item.brand && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.brand}
                    </span>
                  )}
                  <Link
                    to={`/products/${item.slug}`}
                    className="text-sm font-medium leading-snug transition-colors hover:text-brand-600 text-pretty"
                  >
                    {item.name}
                  </Link>
                  {(item.color || item.size) && (
                    <span className="text-xs text-muted-foreground">
                      {[
                        item.color && `Colour: ${item.color}`,
                        item.size && `Size: ${item.size}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    Quantity {item.quantity} × {formatPrice(item.unitPaise, item.currency)}
                  </span>
                </span>

                <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
                  {formatPrice(item.subtotalPaise, item.currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-medium">Merchandise subtotal</dt>
              <dd className="font-semibold tabular-nums text-ink-950">
                {formatPrice(snapshot.merchandiseSubtotalPaise)}
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <AddressSummary
            heading="Contact and delivery"
            headingId="demo-delivery"
            address={snapshot.deliveryAddress}
            contact={snapshot.contact}
            as="h2"
          />
          <AddressSummary
            heading="Billing address"
            headingId="demo-billing"
            address={snapshot.billingAddress}
            as="h2"
          />
        </div>

        <section
          aria-labelledby="demo-method"
          className="mt-4 rounded-card border border-border p-4"
        >
          <h2 id="demo-method" className="text-sm font-semibold uppercase tracking-wide">
            Demo payment method
          </h2>
          <p className="mt-2 text-sm text-ink-800">{methodLabel ?? 'Not selected'}</p>
          <p className="mt-1 text-xs text-muted-foreground text-pretty">
            Recorded as a preference. Nothing was charged and no payment details were
            collected.
          </p>
        </section>

        <p className="mt-6 flex gap-2 rounded-card border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" focusable="false" />
          <span className="text-pretty">
            There is no payment status, invoice, shipment, or delivery date here,
            because none exists. A real order needs backend pricing, shipping, tax,
            inventory, and a payment provider — none of which this build has.
          </span>
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="min-h-11">
            <Link to="/collections">Continue shopping</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-h-11">
            <Link to="/cart">Return to bag</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
