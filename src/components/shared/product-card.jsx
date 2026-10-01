import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { ProductImage } from '@/components/shared/product-image'
import { useStore } from '@/features/cart/use-store'
import { formatPrice } from '@/services/catalog'
import { cn } from '@/lib/utils'

/**
 * Compact product tile for the storefront grids.
 *
 * Interactive elements are siblings, never nested: the title link covers the
 * product, and the wishlist button sits beside it in the DOM. The card uses a
 * "stretched link" overlay for the image so the whole tile is clickable
 * without wrapping the wishlist button inside an anchor.
 *
 * The card shows no rating. The scraped marketplace rating is not a FITNEX
 * verified-buyer review and is not presented as one; the product page labels
 * it explicitly instead.
 */
export function ProductCard({ product, className, priority = false }) {
  const { isWishlisted, toggleWishlist } = useStore()
  const reduceMotion = useReducedMotion()
  const wishlisted = isWishlisted(product.id)

  const price = formatPrice(product.pricePaise, product.currency)
  const compareAt = formatPrice(product.compareAtPaise, product.currency)

  return (
    <motion.article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-border bg-card',
        'transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.18)]',
        className,
      )}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <ProductImage
          image={product.primaryImage}
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className={cn(
            'size-full object-contain transition-transform duration-300 ease-athletic',
            !reduceMotion && 'group-hover:scale-[1.04]',
          )}
        />

        {/* Sibling of the title link — not nested inside it. */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={wishlisted}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from your wishlist`
              : `Save ${product.name} to your wishlist`
          }
          className={cn(
            'absolute right-2 top-2 z-20 inline-flex size-11 items-center justify-center rounded-full',
            'bg-background/90 backdrop-blur transition-colors hover:bg-background',
          )}
        >
          <Heart
            className={cn(
              'size-5 transition-colors',
              wishlisted ? 'fill-brand-500 text-brand-500' : 'text-ink-600',
            )}
            aria-hidden="true"
            focusable="false"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.brand && (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
        )}

        <h3 className="text-sm font-medium leading-snug text-pretty">
          {/* The overlay makes the whole tile clickable while keeping exactly
              one anchor in the DOM. `z-10` sits below the wishlist button. */}
          <Link
            to={`/products/${product.slug}`}
            className="after:absolute after:inset-0 after:z-10 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          {price && (
            <span className="font-semibold tabular-nums text-ink-950">{price}</span>
          )}
          {compareAt && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {compareAt}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
