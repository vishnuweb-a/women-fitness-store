import { useParams } from 'react-router-dom'

import { PageShell, PhasePlaceholder } from '@/components/shared/page-shell'

export function CollectionDetailPage() {
  const { slug } = useParams()

  return (
    <PageShell
      title={slug ? slug.replace(/-/g, ' ') : 'Collection'}
      description="Filterable product listing for this collection."
      className="[&_h1]:capitalize"
    >
      <PhasePlaceholder>
        Filters, sorting, pagination, and the product grid are built in a later
        phase.
      </PhasePlaceholder>
    </PageShell>
  )
}
