import { motion, useReducedMotion } from 'motion/react'

import { EmptyState } from '@/components/shared/empty-state'
import { ProductCard } from '@/components/shared/product-card'
import { cn } from '@/lib/utils'

/**
 * Responsive product grid — 2 across on mobile, 4 on desktop, matching the
 * reference listing density.
 *
 * Cards reveal on scroll with a small stagger.
 *
 * The reveal animates **from** full opacity rather than to it: `initial` is
 * only a transform, never `opacity: 0`. An opacity-gated reveal makes the
 * grid's content depend on an IntersectionObserver firing, which means a card
 * is genuinely invisible — not merely un-animated — to a full-page screenshot,
 * a print view, a browser that restores scroll programmatically, or anything
 * that never dispatches a scroll. Moving a visible card a few pixels gets the
 * same feel with none of that risk.
 *
 * Under reduced motion nothing animates at all.
 */
export function ProductGrid({ products, className, emptyState, columns = 4 }) {
  const reduceMotion = useReducedMotion()

  if (!products || products.length === 0) {
    return (
      emptyState ?? (
        <EmptyState
          title="No products to show"
          description="Nothing matches this view yet."
        />
      )
    )
  }

  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4',
        columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        columns === 4 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
        className,
      )}
    >
      {products.map((product, index) => (
        <motion.li
          key={product.id}
          className="flex"
          initial={reduceMotion ? false : { y: 14 }}
          whileInView={reduceMotion ? undefined : { y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
            delay: Math.min(index, 7) * 0.04,
          }}
        >
          <ProductCard product={product} className="w-full" priority={index < 4} />
        </motion.li>
      ))}
    </ul>
  )
}
