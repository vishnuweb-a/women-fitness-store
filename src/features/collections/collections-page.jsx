import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { PromotionalBanner } from '@/components/shared/promotional-banner'
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
 *
 * The tiles use `PromotionalBanner`: each category's banner artwork already
 * carries its own headline and button shape in the pixels, so no HTML heading,
 * description, count, or CTA is layered on top — that duplicated the baked
 * copy and the two sets of text overlapped. The artwork stays decorative and
 * one real link covers the tile, taking its accessible name from visually
 * hidden text.
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
                <PromotionalBanner
                  src={category.banner}
                  to={`/collections/${category.slug}`}
                  label={`Browse ${category.longLabel}`}
                />
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
