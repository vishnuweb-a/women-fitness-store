import { useEffect, useId, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Heart, Info, ShieldQuestion } from 'lucide-react'

import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { EmptyState } from '@/components/shared/empty-state'
import { PageMeta } from '@/components/shared/page-meta'
import { ProductGrid } from '@/components/shared/product-grid'
import { QuantityStepper } from '@/components/shared/quantity-stepper'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { useStore } from '@/features/cart/use-store'
import { ProductGallery } from '@/features/product/product-gallery'
import { getRelatedProducts } from '@/services/catalog-query'
import { CATEGORY_META, formatPrice, getProductBySlug } from '@/services/catalog'
import { cn } from '@/lib/utils'

/**
 * Product detail.
 *
 * The layout follows the product reference — breadcrumbs, gallery with
 * thumbnails and enlargement, name/brand/price, options, quantity, add to bag,
 * wishlist, specifications, related products.
 *
 * What the reference shows and this page deliberately omits, because the
 * catalog carries no data behind any of it:
 *
 *   - **No "In stock" badge, delivery estimate, or pincode check.** Stock is
 *     unknown for every product.
 *   - **No customer reviews or star summary.** FITNEX has collected none. The
 *     scraped marketplace rating is shown only with its origin stated.
 *   - **No "Buy now".** Checkout is a demonstration that takes no payment, so
 *     a second checkout-shaped button promising a faster purchase would be a
 *     lie about something people act on.
 *   - **No size chart, care instructions, shipping policy, or guarantee tabs**
 *     beyond the specification fields the source actually supplies.
 *
 * Selected options are stored as the catalog's own labels. They are not SKU
 * identifiers: the source lists sizes and colours independently and never says
 * which combinations exist.
 *
 * The route keys this page on the slug (`router.jsx`), so navigating to a
 * different product mounts a fresh component rather than carrying one
 * product's size, colour, and quantity selections into another.
 */
export function ProductDetailPage() {
  const { slug } = useParams()
  const product = getProductBySlug(slug)

  const { addToCart, isWishlisted, toggleWishlist } = useStore()
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(null)
  const quantityId = useId()

  // Clear the "added" confirmation after a while so it does not linger.
  useEffect(() => {
    if (!added) return undefined
    const timer = window.setTimeout(() => setAdded(null), 6000)
    return () => window.clearTimeout(timer)
  }, [added])

  if (!product) {
    return (
      <div className="container-site py-section">
        <PageMeta
          title="Product not available"
          description="This product is not in the FITNEX WOMEN catalog."
        />
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Collections', to: '/collections' },
            { label: 'Not found' },
          ]}
          className="mb-6"
        />
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
  // A single listed option is not a choice — it is applied automatically.
  const requiresSize = product.productType === 'clothing' && product.sizes.length > 1
  const requiresColor = product.colors.length > 1
  const singleSize = product.sizes.length === 1 ? product.sizes[0] : null
  const singleColor = product.colors.length === 1 ? product.colors[0] : null

  const categoryMeta = CATEGORY_META[product.categorySlug]
  const related = getRelatedProducts(product, { limit: 4 })
  const wishlisted = isWishlisted(product.id)
  const price = formatPrice(product.pricePaise, product.currency)

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
    const selectedSize = size ?? singleSize
    const selectedColor = color ?? singleColor

    addToCart({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    })

    setAdded({ quantity, size: selectedSize, color: selectedColor })
  }

  const specifications = [
    ['Brand', product.brand],
    ['Category', product.categoryLabel],
    ['Material', product.material],
    ['Fit', product.fit],
    ['Pattern', product.pattern],
    ['Sport', product.sport],
    ['Care', product.careInstructions],
  ].filter(([, value]) => Boolean(value))

  return (
    <div className="container-site py-8 sm:py-10">
      <PageMeta
        title={product.name}
        description={
          product.description
            ? product.description.slice(0, 155)
            : `${product.name} from ${product.brand}, in the FITNEX WOMEN catalog.`
        }
      />
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Collections', to: '/collections' },
          ...(categoryMeta
            ? [{ label: categoryMeta.longLabel, to: `/collections/${product.categorySlug}` }]
            : []),
          { label: product.name },
        ]}
        className="mb-6"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <ProductGallery product={product} />

        <div className="min-w-0">
          {product.brand && (
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
          )}

          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            <Link
              to={`/collections/${product.categorySlug}`}
              className="hover:text-brand-600 hover:underline underline-offset-2"
            >
              {product.categoryLabel}
            </Link>
          </p>

          {price && (
            <p className="mt-4 text-3xl font-bold tabular-nums text-ink-950">{price}</p>
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
                by {product.sourceRating.count.toLocaleString('en-IN')} shoppers on the
                original marketplace listing. FITNEX has not collected its own reviews
                for this product.
              </span>
            </p>
          )}

          {/* Colour. Independent of size — a pairing is not an availability claim. */}
          {product.colors.length > 0 && (
            <OptionGroup
              legend="Colour"
              required={requiresColor}
              options={product.colors}
              selected={requiresColor ? color : singleColor}
              onSelect={(value) => {
                setColor(value)
                setError(null)
              }}
              readOnly={!requiresColor}
            />
          )}

          {product.sizes.length > 0 && (
            <OptionGroup
              legend="Size"
              required={requiresSize}
              options={product.sizes}
              selected={requiresSize ? size : singleSize}
              onSelect={(value) => {
                setSize(value)
                setError(null)
              }}
              readOnly={!requiresSize}
            />
          )}

          {(product.sizes.length > 0 || product.colors.length > 0) && (
            <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
              <ShieldQuestion
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
                focusable="false"
              />
              <span className="text-pretty">
                Sizes and colours are supplied as independent lists. We cannot confirm
                which size and colour combinations exist, and stock levels are not
                available for this catalog.
              </span>
            </p>
          )}

          <div className="mt-6">
            <p className="text-sm font-semibold">Quantity</p>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              label={product.name}
              inputId={quantityId}
              className="mt-2"
            />
          </div>

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

          {/*
            One polite live region for the add-to-bag result. A single status
            node that is always in the DOM means the message is announced once,
            rather than the region being announced as it mounts and again as it
            fills.
          */}
          <p role="status" aria-live="polite" className="mt-3 min-h-10 text-sm">
            {added && (
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-medium text-success">
                <Check className="size-4 shrink-0" aria-hidden="true" focusable="false" />
                Added {added.quantity} {added.quantity === 1 ? 'item' : 'items'}
                {[added.color, added.size].filter(Boolean).length > 0 && (
                  <span className="font-normal text-ink-700">
                    ({[added.color, added.size].filter(Boolean).join(', ')})
                  </span>
                )}{' '}
                to your bag.
                <Link to="/cart" className="underline underline-offset-2">
                  View bag
                </Link>
              </span>
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground text-pretty">
            Your bag is saved in this browser only. Adding an item does not reserve
            stock, and checkout is a demonstration that takes no payment.
          </p>

          {product.description && (
            <section aria-labelledby="product-description" className="mt-8 border-t border-border pt-6">
              <h2
                id="product-description"
                className="text-sm font-semibold uppercase tracking-wide"
              >
                Description
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700 text-pretty">
                {product.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Supplied by the original product listing.
              </p>
            </section>
          )}

          {specifications.length > 0 && (
            <section aria-labelledby="product-specs" className="mt-6 border-t border-border pt-6">
              <h2 id="product-specs" className="text-sm font-semibold uppercase tracking-wide">
                Specifications
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2">
                {specifications.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-b-0"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium text-ink-800">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-muted-foreground text-pretty">
                Only the specifications supplied with the product listing are shown.
                Measurements, care guidance, and warranty terms were not supplied and
                are not shown rather than estimated.
              </p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-products" className="mt-14 border-t border-border pt-10">
          <SectionHeading
            id="related-products"
            title="More in this category"
            subtitle={`Other ${product.categoryLabel.toLowerCase()} from the catalog.`}
          />
          <ProductGrid products={related} className="mt-6" columns={4} />
        </section>
      )}
    </div>
  )
}

/**
 * A listed-option group.
 *
 * When only one option is listed there is nothing to choose: it is shown as
 * text rather than a single pre-selected button that looks interactive. When
 * there are several, each is a toggle button carrying `aria-pressed`, grouped
 * in a `fieldset` whose `legend` names the group.
 */
function OptionGroup({ legend, options, selected, onSelect, required, readOnly }) {
  if (readOnly) {
    return (
      <p className="mt-6 text-sm">
        <span className="font-semibold">{legend}:</span>{' '}
        <span className="text-ink-700">{options[0]}</span>
      </p>
    )
  }

  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-semibold">
        {legend}
        {required && (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
        {selected && (
          <span className="ml-2 font-normal text-muted-foreground">{selected}</span>
        )}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={selected === option}
            className={cn(
              'min-h-11 min-w-11 rounded-control border px-4 text-sm transition-colors',
              selected === option
                ? 'border-brand-500 bg-brand-50 font-semibold text-brand-700'
                : 'border-border hover:border-ink-400',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
