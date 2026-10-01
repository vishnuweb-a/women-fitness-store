import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Heart, Info } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { ProductImage } from '@/components/shared/product-image'
import { Button } from '@/components/ui/button'
import { useStore } from '@/features/cart/use-store'
import { formatPrice, getProductBySlug } from '@/services/catalog'
import { cn } from '@/lib/utils'

/**
 * Product detail.
 *
 * Minimal but functional: gallery, price, description, supplied options, and a
 * working add-to-bag. The full reference layout (specifications tabs, reviews,
 * related products, delivery check) belongs to the product-detail phase.
 *
 * Honesty constraints enforced here:
 *   - Size and colour are **independent option lists** from the source. The UI
 *     says so and never implies a given combination is in stock.
 *   - Stock is unknown; no "In stock" badge is shown.
 *   - The scraped rating is labelled as a marketplace listing rating, not a
 *     FITNEX verified-buyer review.
 */
export function ProductDetailPage() {
  const { slug } = useParams()
  const product = getProductBySlug(slug)

  const { addToCart, isWishlisted, toggleWishlist } = useStore()
  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="container-site py-section">
        <h1 className="font-display text-display-sm font-extrabold tracking-tight">
          Product not available
        </h1>
        <div className="mt-8">
          <EmptyState
            title="We could not find that product"
            description={`No product matches “${slug}”. It may have been removed, or the link may be incorrect.`}
            action={
              <Button asChild className="mt-2">
                <Link to="/collections">Browse the catalog</Link>
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  // Clothing is sized; equipment and accessories in this catalog are not.
  const requiresSize = product.productType === 'clothing' && product.sizes.length > 0
  const requiresColor = product.colors.length > 1

  function handleAddToCart() {
    if (requiresSize && !size) {
      setError('Select a size before adding this item to your bag.')
      return
    }
    if (requiresColor && !color) {
      setError('Select a colour before adding this item to your bag.')
      return
    }

    setError(null)
    addToCart({
      productId: product.id,
      size: size ?? (product.sizes.length === 1 ? product.sizes[0] : null),
      color: color ?? (product.colors.length === 1 ? product.colors[0] : null),
      quantity: 1,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 4000)
  }

  const wishlisted = isWishlisted(product.id)
  const price = formatPrice(product.pricePaise, product.currency)
  const image = product.images[activeImage] ?? product.primaryImage

  return (
    <div className="container-site py-section">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {!product.hasSingleImage && (
            <ul
              aria-label="Product images"
              className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-y-auto"
            >
              {product.images.slice(0, 8).map((item, index) => (
                <li key={item.localSrc}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={item.alt}
                    aria-current={index === activeImage}
                    className={cn(
                      'size-16 shrink-0 overflow-hidden rounded-control border-2 bg-muted transition-colors',
                      index === activeImage ? 'border-brand-500' : 'border-border',
                    )}
                  >
                    <ProductImage
                      image={{ ...item, alt: '' }}
                      sizes="64px"
                      className="size-full object-contain"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex-1 overflow-hidden rounded-card border border-border bg-muted">
            <div className="aspect-[3/4]">
              <ProductImage
                image={image}
                priority
                sizes="(min-width: 1024px) 480px, 100vw"
                className="size-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          {product.brand && (
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
          )}

          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            {product.name}
          </h1>

          {price && (
            <p className="mt-4 text-2xl font-bold tabular-nums text-ink-950">{price}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          {/* Marketplace rating — explicitly not a FITNEX review. */}
          {product.sourceRating && (
            <p className="mt-4 flex items-start gap-2 rounded-control bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" focusable="false" />
              <span className="text-pretty">
                Rated{' '}
                <span className="font-semibold tabular-nums text-ink-800">
                  {product.sourceRating.value.toFixed(1)}/5
                </span>{' '}
                by {product.sourceRating.count.toLocaleString('en-IN')} shoppers on
                the original marketplace listing. FITNEX has not collected its own
                reviews for this product.
              </span>
            </p>
          )}

          {/* Options. Independent lists — a pairing is not an availability claim. */}
          {product.colors.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">
                Colour{requiresColor && <span aria-hidden="true"> *</span>}
                {!requiresColor && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    {product.colors[0]}
                  </span>
                )}
              </legend>
              {requiresColor && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colors.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setColor(option)
                        setError(null)
                      }}
                      aria-pressed={color === option}
                      className={cn(
                        'min-h-11 rounded-control border px-4 text-sm transition-colors',
                        color === option
                          ? 'border-brand-500 bg-brand-50 font-semibold text-brand-700'
                          : 'border-border hover:border-ink-400',
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
          )}

          {product.sizes.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">
                Size{requiresSize && <span aria-hidden="true"> *</span>}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSize(option)
                      setError(null)
                    }}
                    aria-pressed={size === option}
                    className={cn(
                      'min-h-11 min-w-11 rounded-control border px-4 text-sm transition-colors',
                      size === option
                        ? 'border-brand-500 bg-brand-50 font-semibold text-brand-700'
                        : 'border-border hover:border-ink-400',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-pretty">
                Sizes and colours are listed independently by the supplier. We
                cannot confirm which combinations are available.
              </p>
            </fieldset>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-brand-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={handleAddToCart} className="min-w-48 flex-1">
              Add to bag
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
            >
              <Heart
                className={cn('size-4', wishlisted && 'fill-brand-500 text-brand-500')}
                aria-hidden="true"
                focusable="false"
              />
              {wishlisted ? 'Saved' : 'Save'}
            </Button>
          </div>

          <p role="status" className="mt-3 min-h-5 text-sm">
            {added && (
              <span className="flex items-center gap-1.5 font-medium text-success">
                <Check className="size-4" aria-hidden="true" focusable="false" />
                Added to your bag.{' '}
                <Link to="/cart" className="underline underline-offset-2">
                  View bag
                </Link>
              </span>
            )}
          </p>

          <p className="mt-2 text-xs text-muted-foreground text-pretty">
            Adding an item saves it in this browser only. It does not reserve
            stock, and stock levels are not available for this catalog.
          </p>

          {product.description && (
            <section className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Product details
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700 text-pretty">
                {product.description}
              </p>
            </section>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Category', product.categoryLabel],
              ['Material', product.material],
              ['Fit', product.fit],
              ['Pattern', product.pattern],
              ['Sport', product.sport],
              ['Care', product.careInstructions],
            ]
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-ink-800">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
