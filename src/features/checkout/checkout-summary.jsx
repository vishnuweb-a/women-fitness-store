import { Info } from 'lucide-react'

import { ProductImage } from '@/components/shared/product-image'
import { formatPrice } from '@/services/catalog'
import { cn } from '@/lib/utils'

/**
 * Order summary shown beside every checkout step.
 *
 * Everything here is derived from the live catalog-backed cart on each render,
 * so a price or quantity change is reflected immediately rather than being
 * read back from a copy made earlier.
 *
 * **No grand total is shown.** Shipping and tax are not calculated anywhere in
 * this build, so any "Total" line would be a number nobody could stand behind.
 * The merchandise subtotal is shown and the rest is stated as pending, exactly
 * as the cart does.
 */
export function CheckoutSummary({ items, count, subtotalPaise, className, headingId = 'checkout-summary' }) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-card border border-border bg-muted/60 p-5', className)}
    >
      <h2 id={headingId} className="font-display text-lg font-bold uppercase tracking-tight">
        Order summary{' '}
        <span className="font-sans text-sm font-normal tabular-nums text-muted-foreground">
          ({count} {count === 1 ? 'item' : 'items'})
        </span>
      </h2>

      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.key} className="flex gap-3">
            <span className="size-16 shrink-0 overflow-hidden rounded-control bg-background">
              <ProductImage
                image={item.product.primaryImage}
                sizes="64px"
                className="size-full object-contain"
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
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
                Qty {item.quantity}
              </span>
            </span>
            <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
              {formatPrice(item.subtotalPaise, item.product.currency)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt>Merchandise subtotal</dt>
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

      <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" focusable="false" />
        <span className="text-pretty">
          No payable total is shown. A final amount needs backend pricing, shipping,
          tax, and inventory checks, none of which exist in this build.
        </span>
      </p>
    </section>
  )
}
