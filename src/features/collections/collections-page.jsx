import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { CollectionListing } from '@/features/catalog/collection-listing'
import { catalogCategories } from '@/services/catalog'

/**
 * Collection index.
 *
 * The reference screen leads with category tiles; below them, the full catalog
 * is a working listing with the same filter/sort/pagination contract as a
 * single category — here the category is itself a filter.
 *
 * Only categories that hold products are listed, so no tile leads nowhere.
 */
export function CollectionsPage() {
  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: 'Collections' }]}
          className="mb-5"
        />

        <section aria-labelledby="category-tiles">
          <h2 id="category-tiles" className="sr-only">
            Shop by category
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {catalogCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/collections/${category.slug}`}
                  className="group relative flex h-full flex-col justify-end overflow-hidden rounded-card bg-ink-950 p-5 transition-shadow hover:shadow-lg"
                >
                  <img
                    src={category.banner}
                    alt=""
                    aria-hidden="true"
                    width="800"
                    height="534"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover opacity-55 transition-transform duration-500 ease-athletic group-hover:scale-105"
                  />
                  <span className="relative">
                    <span className="block font-display text-xl font-bold uppercase tracking-tight text-white">
                      {category.longLabel}
                    </span>
                    <span className="mt-1 block text-sm text-white/80 text-pretty">
                      {category.description}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white">
                      Shop {category.count} products
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
        </section>
      </div>

      <CollectionListing
        title="All products"
        description="Everything in the catalog. Filter by category, brand, price, and the sizes and colours each product lists."
        resetTo="/collections"
        breadcrumbs={null}
      />
    </>
  )
}
