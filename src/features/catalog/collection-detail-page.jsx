import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/shared/empty-state'
import { PageShell } from '@/components/shared/page-shell'
import { Button } from '@/components/ui/button'
import { CollectionListing } from '@/features/catalog/collection-listing'
import { getCategory } from '@/services/catalog'

/**
 * One category's listing — filters, sorting, and pagination all driven by the
 * URL. The category itself is fixed by the route, so it is not a filter here.
 *
 * `key` on the listing forces a fresh instance when the slug changes, so
 * navigating between categories cannot carry one category's listing state into
 * another.
 */
export function CollectionDetailPage() {
  const { slug } = useParams()
  const category = getCategory(slug)

  if (!category) {
    return (
      <PageShell
        title="Collection not found"
        description="This collection does not exist in the catalog."
        noIndex
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

  return (
    <CollectionListing
      key={category.slug}
      scopeCategory={category.slug}
      title={category.longLabel}
      description={category.description}
      banner={category.banner}
      resetTo={`/collections/${category.slug}`}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Collections', to: '/collections' },
        { label: category.longLabel },
      ]}
    />
  )
}
