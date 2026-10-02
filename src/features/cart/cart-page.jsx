import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, Info, ShoppingBag, Trash2, TriangleAlert } from 'lucide-react'

import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { EmptyState } from '@/components/shared/empty-state'
import { ProductImage } from '@/components/shared/product-image'
import { QuantityStepper } from '@/components/shared/quantity-stepper'
import { Button } from '@/components/ui/button'
import { useStore } from '@/features/cart/use-store'
import { formatPrice } from '@/services/catalog'

/**
 * Shopping bag.
 *
 * The layout follows the cart reference — line items on the left, a summary
 * card on the right — with every unsupported claim removed:
 *
 *   - **No grand total.** Shipping and tax are not calculated anywhere, so a
 *     "Total" line would be a number nobody can stand behind. A merchandise
 *     subtotal is shown and the rest is stated as pending.
 *   - **No free-shipping banner, promo code, or delivery date.** None of it is
 *     backed by anything.
 *   - **No "In stock" markers.** Stock is unknown for every product.
 *   - **Checkout leads to a demo flow**, named as one. No payment provider is
 *     integrated and no order is ever created.
 *
 * Totals are derived from the catalog at render time, never from storage, so a
 * price change is reflected immediately. All money is integer paise until the
 * moment it is formatted.
 */
export function CartPage() {
  const {
    cartItems,
    unavailableItems,
    cartCount,
    cartSubtotalPaise,
    setQuantity,
    removeFromCart,
    moveToWishlist,
  } = useStore()

  // One polite region for cart feedback, so a removal is announced once
  // rather than every quantity keystroke producing an announcement.
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function announce(text) {
    window.clearTimeout(timer.current)
    setMessage(text)
    timer.current = window.setTimeout(() => setMessage(''), 5000)
  }

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Your bag' }]

  // Unavailable lines cannot be priced, so the demo checkout would have to
  // either ignore or invent them. It stays closed until they are removed.
  const canCheckout = cartItems.length > 0 && unavailableItems.length === 0

  if (cartItems.length === 0 && unavailableItems.length === 0) {
    return (
      <div className="container-site py-8 sm:py-10">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        <h1 className="font-display text-display-sm font-extrabold tracking-tight">Your bag</h1>
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Nothing has been added yet. Browse the catalog to get started."
            action={
              <Button asChild className="mt-2">
                <Link to="/collections">Continue shopping</Link>
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container-site py-8 sm:py-10">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-display-sm font-extrabold uppercase tracking-tight">
          Your bag{' '}
          <span className="tabular-nums text-muted-foreground">({cartCount})</span>
        </h1>
        <Link
          to="/collections"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-brand-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" focusable="false" />
          Continue shopping
        </Link>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-10">
        <div className="min-w-0">
          <ul className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <li
                key={item.key}
                className="flex flex-wrap gap-4 rounded-card border border-border p-3 sm:flex-nowrap sm:p-4"
              >
                <Link
                  to={`/products/${item.product.slug}`}
                  className="size-24 shrink-0 overflow-hidden rounded-control bg-muted sm:size-28"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <ProductImage
                    image={item.product.primaryImage}
                    sizes="112px"
                    className="size-full object-contain"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="min-w-0">
                      {item.product.brand && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {item.product.brand}
                        </p>
                      )}
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="text-sm font-medium leading-snug hover:text-brand-600 text-pretty"
                      >
                        {item.product.name}
                      </Link>
                    </div>

                    <p className="shrink-0 text-right">
                      <span className="block font-semibold tabular-nums text-ink-950">
                        {formatPrice(item.subtotalPaise, item.product.currency)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="block text-xs tabular-nums text-muted-foreground">
                          {formatPrice(item.unitPaise, item.product.currency)} each
                        </span>
                      )}
                    </p>
                  </div>

                  {/* The selected catalog labels — not inventory identifiers. */}
                  {(item.line.color || item.line.size) && (
                    <p className="text-xs text-muted-foreground">
                      {[
                        item.line.color && `Colour: ${item.line.color}`,
                        item.line.size && `Size: ${item.line.size}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(next) => setQuantity(item.key, next)}
                      label={item.product.name}
                      inputId={`qty-${item.key}`}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        moveToWishlist(item.key)
                        announce(`${item.product.name} moved to your wishlist.`)
                      }}
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand-600"
                    >
                      <Heart className="size-4" aria-hidden="true" focusable="false" />
                      Move to wishlist
                      <span className="sr-only">: {item.product.name}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        removeFromCart(item.key)
                        announce(`${item.product.name} removed from your bag.`)
                      }}
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand-600"
                    >
                      <Trash2 className="size-4" aria-hidden="true" focusable="false" />
                      Remove
                      <span className="sr-only"> {item.product.name}</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/*
            Lines whose product is no longer in the catalog. Shown rather than
            silently dropped, and never priced — there is no price to use.
          */}
          {unavailableItems.length > 0 && (
            <section
              aria-labelledby="unavailable-lines"
              className="mt-6 rounded-card border border-warning/40 bg-warning/5 p-4"
            >
              <h2
                id="unavailable-lines"
                className="flex items-center gap-2 text-sm font-semibold text-ink-900"
              >
                <TriangleAlert
                  className="size-4 shrink-0 text-warning"
                  aria-hidden="true"
                  focusable="false"
                />
                {unavailableItems.length}{' '}
                {unavailableItems.length === 1 ? 'item is' : 'items are'} no longer in the
                catalog
              </h2>
              <p className="mt-1 text-xs text-muted-foreground text-pretty">
                These were saved in this browser earlier but no longer match a product.
                They are not included in the subtotal.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {unavailableItems.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-ink-700">
                      Product {item.line.productId}
                      {item.line.size ? ` · Size: ${item.line.size}` : ''}
                      {item.line.color ? ` · Colour: ${item.line.color}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromCart(item.key)
                        announce('Unavailable item removed from your bag.')
                      }}
                      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-600"
                    >
                      <Trash2 className="size-4" aria-hidden="true" focusable="false" />
                      Remove
                      <span className="sr-only"> product {item.line.productId}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside aria-labelledby="order-summary" className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-card border border-border bg-muted/60 p-5">
            <h2
              id="order-summary"
              className="font-display text-lg font-bold uppercase tracking-tight"
            >
              Order summary
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt>
                  Merchandise subtotal{' '}
                  <span className="text-muted-foreground tabular-nums">
                    ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                  </span>
                </dt>
                <dd className="font-semibold tabular-nums text-ink-950">
                  {formatPrice(cartSubtotalPaise)}
                </dd>
              </div>

              {/*
                Shipping and tax are not calculated. Stating that plainly is the
                only honest option — a "FREE" badge or a ₹0 line would both be
                inventions, and so would a grand total built on them.
              */}
              <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-muted-foreground">Not calculated</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Taxes</dt>
                <dd className="text-muted-foreground">Not calculated</dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-muted-foreground text-pretty">
              The subtotal covers merchandise only. Shipping and tax are not
              calculated in this build, so no payable total is shown.
            </p>

            {/*
              The demo checkout flow. The wording names what it is before it is
              entered — this button leads to a demonstration of the checkout
              screens, not to a purchase. Lines whose product has left the
              catalog cannot be priced, so checkout stays closed until they are
              removed.
            */}
            {canCheckout ? (
              <Button asChild className="mt-5 min-h-11 w-full" size="lg">
                <Link to="/checkout">Continue to demo checkout</Link>
              </Button>
            ) : (
              <Button disabled className="mt-5 min-h-11 w-full" size="lg">
                Continue to demo checkout
              </Button>
            )}

            {unavailableItems.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground text-pretty">
                Remove the items that are no longer in the catalog to continue.
              </p>
            )}

            <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" focusable="false" />
              <span className="text-pretty">
                This is a demonstration storefront. Checkout is a frontend
                demonstration only: no payment will be taken, no order will be
                placed, and nothing in your bag is reserved. Your bag is stored in
                this browser only.
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
