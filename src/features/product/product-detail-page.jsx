import { useParams } from 'react-router-dom'

import { PageShell, PhasePlaceholder } from '@/components/shared/page-shell'

export function ProductDetailPage() {
  const { slug } = useParams()

  return (
    <PageShell
      title={slug ? slug.replace(/-/g, ' ') : 'Product'}
      description="Product gallery, variants, and details."
      className="[&_h1]:capitalize"
    >
      <PhasePlaceholder>
        Gallery, variant pickers, reviews, and add-to-bag are built in a later
        phase.
      </PhasePlaceholder>
    </PageShell>
  )
}
