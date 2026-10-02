/**
 * Demo order records.
 *
 * ## One source, not two
 *
 * Every entry here comes from `CheckoutProvider`'s frozen `completed`
 * snapshots — the same records the confirmation page reads. No second order
 * store exists, nothing is copied into one, and no snapshot is modified:
 * duplicating the source would mean two places that could disagree about what
 * a demo checkout contained.
 *
 * ## What is shown, and what is not
 *
 * Only fields the snapshot actually carries: the demo reference, the items
 * and their quantities, the merchandise subtotal, the recorded method
 * preference, and the completion time. There is deliberately no paid or
 * fulfilled status, no tracking, no invoice, no cancellation, no refund, and
 * no delivery date — none of those exist, and each is something a person
 * would act on.
 *
 * Snapshots live in memory for one page session, so this list is empty after
 * a reload. That is stated rather than hidden.
 */
import { Link } from 'react-router-dom'
import { Receipt } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { ProductImage } from '@/components/shared/product-image'
import { Button } from '@/components/ui/button'
import { getPaymentMethodLabel } from '@/features/checkout/checkout-schema'
import { useCheckout } from '@/features/checkout/use-checkout'
import { CustomerLayout } from '@/features/customer/customer-layout'
import { listDemoSnapshots } from '@/features/customer/demo-orders'
import { formatPrice } from '@/services/catalog'

export function DemoOrdersPage() {
  const { state } = useCheckout()
  const snapshots = listDemoSnapshots(state.completed)

  return (
    <CustomerLayout
      title="Demo orders"
      description="Demo checkouts completed in this browser tab. No real order exists, because checkout takes no payment and places nothing."
    >
      {snapshots.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No real orders yet. Checkout currently runs in demo mode."
          description="Completing the demo checkout in this tab records a snapshot here for the rest of the session. Nothing is stored, so the list is empty again after a reload."
          action={
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/collections">Continue shopping</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/cart">Go to your bag</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {snapshots.map((snapshot) => (
            <DemoOrderCard key={snapshot.reference} snapshot={snapshot} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm text-muted-foreground text-pretty">
        These records show only what the demo checkout captured. There is no payment
        status, shipment, tracking, invoice, or delivery date here, because none
        exists — a real order needs backend pricing, shipping, tax, inventory, and a
        payment provider, none of which this build has.
      </p>
    </CustomerLayout>
  )
}

function DemoOrderCard({ snapshot }) {
  const headingId = `demo-order-${snapshot.reference}`
  const methodLabel = getPaymentMethodLabel(snapshot.paymentMethod)

  return (
    <li>
      <section
        aria-labelledby={headingId}
        className="rounded-card border border-border p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {/*
              The label comes before the reference, so the first thing read is
              what this is — not a number that could be mistaken for an order.
            */}
            <p className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink-700">
              Demo checkout
            </p>
            <h2
              id={headingId}
              className="mt-1.5 break-all font-mono text-sm font-semibold text-ink-950"
            >
              {snapshot.reference}
            </h2>
            {/* Only rendered when the snapshot actually recorded a time. */}
            {snapshot.createdAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Completed{' '}
                <time dateTime={snapshot.createdAt}>
                  {new Date(snapshot.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
              </p>
            )}
          </div>

          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link to={`/orders/${snapshot.reference}/confirmation`}>
              View details
              <span className="sr-only"> for demo checkout {snapshot.reference}</span>
            </Link>
          </Button>
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {snapshot.items.map((item) => (
            <li key={item.key} className="flex items-center gap-3">
              <span className="size-12 shrink-0 overflow-hidden rounded-control bg-muted">
                <ProductImage
                  image={item.image}
                  sizes="48px"
                  className="size-full object-contain"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <Link
                  to={`/products/${item.slug}`}
                  className="truncate text-sm font-medium transition-colors hover:text-brand-600"
                >
                  {item.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {[
                    item.color && `Colour: ${item.color}`,
                    item.size && `Size: ${item.size}`,
                    `Quantity ${item.quantity}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <span className="shrink-0 text-sm tabular-nums text-ink-800">
                {formatPrice(item.subtotalPaise, item.currency)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 grid gap-2 border-t border-border pt-3 text-sm sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-4 sm:justify-start sm:gap-2">
            <dt className="text-muted-foreground">Merchandise subtotal</dt>
            <dd className="font-semibold tabular-nums text-ink-950">
              {formatPrice(snapshot.merchandiseSubtotalPaise)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 sm:justify-end sm:gap-2">
            <dt className="text-muted-foreground">Demo payment method</dt>
            <dd className="text-ink-900">{methodLabel ?? 'Not selected'}</dd>
          </div>
        </dl>
      </section>
    </li>
  )
}
