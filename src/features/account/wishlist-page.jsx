/**
 * Saved products.
 *
 * Backed by the same browser-local store as the header's heart buttons, so a
 * product saved from a grid appears here and survives a reload. The storage
 * key and its shape are unchanged from Phase 1 — a wishlist saved before this
 * page was polished still loads.
 *
 * ## Why there is no "Add to bag" on a card
 *
 * The wishlist holds products, not variants. For anything that requires a
 * size or colour choice, this page sends the person to the product page to
 * choose rather than adding an arbitrary one on their behalf — picking a
 * variant nobody selected is the kind of silent decision that ends in the
 * wrong item in the bag. Where a product has exactly one listed option (or
 * none), there is nothing to choose and the item is added directly.
 *
 * A saved product that has left the catalog is shown as unavailable and can
 * be removed, rather than disappearing without explanation.
 */
import { useEffect, useRef, useState } from 'react'
import { Heart, PackageX, ShoppingBag, SlidersHorizontal, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/shared/empty-state'
import { PageShell } from '@/components/shared/page-shell'
import { ProductImage } from '@/components/shared/product-image'
import { Button } from '@/components/ui/button'
import { useStore } from '@/features/cart/use-store'
import { requiresOptionChoice } from '@/features/account/wishlist-options'
import { formatPrice } from '@/services/catalog'

export function WishlistPage() {
  const { wishlistItems, unavailableWishlistIds, removeFromWishlist, addToCart } = useStore()
  const [status, setStatus] = useState(null)

  // Clear the confirmation after a while so it does not linger.
  const timerRef = useRef(null)
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function announce(message) {
    setStatus(message)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setStatus(null), 6000)
  }

  const total = wishlistItems.length
  const isEmpty = total === 0 && unavailableWishlistIds.length === 0

  return (
    <PageShell
      title="Wishlist"
      description="Products you have saved. Your wishlist is stored in this browser only — it is not synced to an account and nothing is reserved."
    >
      {/*
        One always-present polite live region, so an action is announced once
        rather than the region being announced as it mounts and again as it
        fills.
      */}
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-medium text-success">
        {status}
      </p>

      {isEmpty ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Select the heart on any product to save it here. Saved products stay in this browser until you remove them."
          action={
            <Button asChild size="lg" className="mt-2">
              <Link to="/collections">Continue shopping</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">
              Saved products{' '}
              <span className="font-normal tabular-nums text-muted-foreground">({total})</span>
            </h2>
            <Button asChild variant="outline" size="lg">
              <Link to="/collections">Continue shopping</Link>
            </Button>
          </div>

          {total > 0 && (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {wishlistItems.map((product) => (
                <WishlistCard
                  key={product.id}
                  product={product}
                  onRemove={() => {
                    removeFromWishlist(product.id)
                    announce(`${product.name} removed from your wishlist.`)
                  }}
                  onAdd={() => {
                    addToCart({
                      productId: product.id,
                      size: product.sizes.length === 1 ? product.sizes[0] : null,
                      color: product.colors.length === 1 ? product.colors[0] : null,
                      quantity: 1,
                    })
                    announce(`${product.name} added to your bag. It is still saved here.`)
                  }}
                />
              ))}
            </ul>
          )}

          {unavailableWishlistIds.length > 0 && (
            <section aria-labelledby="wishlist-unavailable" className="mt-8">
              <h2 id="wishlist-unavailable" className="text-base font-semibold">
                No longer in the catalog{' '}
                <span className="font-normal tabular-nums text-muted-foreground">
                  ({unavailableWishlistIds.length})
                </span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                These were saved in this browser but are not in the catalog any more,
                so there is nothing to show or price. You can remove them.
              </p>

              <ul className="mt-4 flex flex-col gap-3">
                {unavailableWishlistIds.map((id) => (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-dashed border-border p-4"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <PackageX
                        className="size-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                        focusable="false"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink-900">
                          Product unavailable
                        </span>
                        <span className="block break-all text-xs text-muted-foreground">
                          Saved reference {id}
                        </span>
                      </span>
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      onClick={() => {
                        removeFromWishlist(id)
                        announce('Unavailable product removed from your wishlist.')
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden="true" focusable="false" />
                      Remove
                      <span className="sr-only"> unavailable product {id}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </PageShell>
  )
}

/** One saved product. */
function WishlistCard({ product, onRemove, onAdd }) {
  const headingId = `wishlist-${product.id}`
  const needsChoice = requiresOptionChoice(product)
  const price = formatPrice(product.pricePaise, product.currency)

  return (
    <li>
      <article
        aria-labelledby={headingId}
        className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-card"
      >
        {/* Not a link. The title below is the product's one anchor, so there
            is a single tab stop and a single announced link per card. */}
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <ProductImage
            image={product.primaryImage}
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
            className="size-full object-contain"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
          )}

          <h3 id={headingId} className="text-sm font-medium leading-snug text-pretty">
            <Link
              to={`/products/${product.slug}`}
              className="transition-colors hover:text-brand-600"
            >
              {product.name}
            </Link>
          </h3>

          {price && (
            <p className="mt-1 font-semibold tabular-nums text-ink-950">{price}</p>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {needsChoice ? (
              <Button asChild variant="outline" className="min-h-11 flex-1">
                <Link to={`/products/${product.slug}`}>
                  <SlidersHorizontal className="size-4" aria-hidden="true" focusable="false" />
                  Choose options
                  <span className="sr-only"> for {product.name}</span>
                </Link>
              </Button>
            ) : (
              <Button type="button" className="min-h-11 flex-1" onClick={onAdd}>
                <ShoppingBag className="size-4" aria-hidden="true" focusable="false" />
                Add to bag
                <span className="sr-only"> — {product.name}</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-brand-600 hover:bg-brand-50 hover:text-brand-700"
              onClick={onRemove}
            >
              <Trash2 className="size-4" aria-hidden="true" focusable="false" />
              Remove
              <span className="sr-only"> {product.name} from your wishlist</span>
            </Button>
          </div>

          {needsChoice && (
            <p className="mt-2 text-xs text-muted-foreground text-pretty">
              This product lists more than one option, so choose a size or colour on
              the product page.
            </p>
          )}
        </div>
      </article>
    </li>
  )
}
