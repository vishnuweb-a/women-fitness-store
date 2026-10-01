import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { PageShell } from '@/components/shared/page-shell'
import { ProductGrid } from '@/components/shared/product-grid'
import { SectionHeading } from '@/components/shared/section-heading'
import { catalogCategories, catalogProducts } from '@/services/catalog'

/**
 * Collection index: the three canonical categories, then the full catalog.
 *
 * Only categories that actually hold products are listed, so no tile leads to
 * an empty collection.
 */
export function CollectionsPage() {
  return (
    <PageShell
      title="Collections"
      description="Everything in the catalog, grouped the way it is supplied."
    >
      <ul className="grid gap-4 sm:grid-cols-3">
        {catalogCategories.map((category) => (
          <li key={category.slug}>
            <Link
              to={`/collections/${category.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-card transition-shadow hover:shadow-lg"
            >
              <span className="aspect-[3/2] overflow-hidden bg-ink-950">
                <img
                  src={category.banner}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 ease-athletic group-hover:scale-105"
                />
              </span>
              <span className="flex flex-1 flex-col p-4">
                <span className="font-display text-lg font-bold uppercase tracking-tight">
                  {category.longLabel}
                </span>
                <span className="mt-1 text-sm text-muted-foreground text-pretty">
                  {category.description}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  {category.count} products
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                    focusable="false"
                  />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="all-products" className="mt-12">
        <SectionHeading
          id="all-products"
          title="All products"
          subtitle={`${catalogProducts.length} products across ${catalogCategories.length} categories.`}
        />
        <ProductGrid products={catalogProducts} className="mt-6" />
      </section>
    </PageShell>
  )
}
