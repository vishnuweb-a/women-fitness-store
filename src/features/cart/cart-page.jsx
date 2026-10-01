import { Link } from 'react-router-dom'
import { Info, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { PageShell } from '@/components/shared/page-shell'
import { ProductImage } from '@/components/shared/product-image'
import { Button } from '@/components/ui/button'
import { useStore } from '@/features/cart/use-store'
import { formatPrice } from '@/services/catalog'

/**
 * Shopping bag.
 *
 * Totals are derived from the catalog at render time, never from storage, so a
 * price change is reflected immediately. The full reference layout (promo
 * codes, order summary card, recommendations) belongs to the cart phase.
 *
 * **Checkout is not operational.** The button below says so and does not link
 * to a payment flow.
 */
export function CartPage() {
  const { cartItems, cartSubtotalPaise, setQuantity, removeFromCart } = useStore()

  if (cartItems.length === 0) {
    return (
      <PageShell title="Your bag">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Browse the catalog and add something to get started."
          action={
            <Button asChild className="mt-2">
              <Link to="/collections">Continue shopping</Link>
            </Button>
          }
        />
      </PageShell>
    )
  }

  return (
    <PageShell title={`Your bag (${cartItems.length})`}>
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ul className="flex flex-col gap-4">
          {cartItems.map((item) => (
            <li
              key={item.key}
              className="flex gap-4 rounded-card border border-border p-3"
            >
              <Link
                to={`/products/${item.product.slug}`}
                className="size-24 shrink-0 overflow-hidden rounded-control bg-muted"
              >
                <ProductImage
                  image={item.product.primaryImage}
                  sizes="96px"
                  className="size-full object-contain"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="text-sm font-medium leading-snug hover:text-brand-600 text-pretty"
                >
                  {item.product.name}
                </Link>

                <p className="mt-1 text-xs text-muted-foreground">
                  {[
                    item.line.color && `Colour: ${item.line.color}`,
                    item.line.size && `Size: ${item.line.size}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center rounded-control border border-border">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.product.name}`}
                      className="inline-flex size-11 items-center justify-center text-ink-700 hover:bg-muted"
                    >
                      <Minus className="size-4" aria-hidden="true" focusable="false" />
                    </button>
                    <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.product.name}`}
                      className="inline-flex size-11 items-center justify-center text-ink-700 hover:bg-muted"
                    >
                      <Plus className="size-4" aria-hidden="true" focusable="false" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-600"
                  >
                    <Trash2 className="size-4" aria-hidden="true" focusable="false" />
                    Remove
                    <span className="sr-only"> {item.product.name}</span>
                  </button>
                </div>
              </div>

              <p className="shrink-0 font-semibold tabular-nums">
                {formatPrice(item.subtotalPaise, item.product.currency)}
              </p>
            </li>
          ))}
        </ul>

        <aside aria-labelledby="order-summary" className="h-fit rounded-card bg-muted p-5">
          <h2 id="order-summary" className="font-display text-lg font-bold uppercase tracking-tight">
            Order summary
          </h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-semibold tabular-nums">
                {formatPrice(cartSubtotalPaise)}
              </dd>
            </div>
          </dl>

          <Button disabled className="mt-5 w-full" size="lg">
            Checkout unavailable
          </Button>

          <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" focusable="false" />
            <span className="text-pretty">
              This is a demonstration storefront. Checkout and payment are not
              operational, no order can be placed, and nothing in your bag is
              reserved.
            </span>
          </p>
        </aside>
      </div>
    </PageShell>
  )
}
