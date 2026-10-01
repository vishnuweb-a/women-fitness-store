import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/shared/empty-state'
import { PageShell } from '@/components/shared/page-shell'
import { ProductGrid } from '@/components/shared/product-grid'
import { Button } from '@/components/ui/button'
import { getCategory, getProductsByCategory } from '@/services/catalog'

/**
 * Products in one category.
 *
 * Minimal by design: filters, sorting, and pagination belong to the collection
 * phase. This route exists so navigation and product links resolve now.
 */
export function CollectionDetailPage() {
  const { slug } = useParams()
  const category = getCategory(slug)

  if (!category) {
    return (
      <PageShell
        title="Collection not found"
        description="This collection does not exist in the catalog."
      >
        <EmptyState
          title="No such collection"
          description="The link may be out of date. Browse the full catalog instead."
          action={
            <Button asChild className="mt-2">
              <Link to="/collections">Browse all collections</Link>
            </Button>
          }
        />
      </PageShell>
    )
  }

  const products = getProductsByCategory(category.slug)

  return (
    <PageShell
      title={category.longLabel}
      description={category.description}
    >
      <p className="-mt-4 mb-6 text-sm text-muted-foreground tabular-nums">
        {products.length} {products.length === 1 ? 'product' : 'products'}
      </p>
      <ProductGrid products={products} />
    </PageShell>
  )
}
