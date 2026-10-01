import { useParams } from 'react-router-dom'

import { PageShell, PhasePlaceholder } from '@/components/shared/page-shell'

export function OrderConfirmationPage() {
  const { id } = useParams()

  return (
    <PageShell
      title="Order confirmation"
      description={id ? `Placeholder route for order ${id}.` : undefined}
    >
      <PhasePlaceholder>
        No orders exist yet. Order lookup, tracking, and invoices are built in
        a later phase.
      </PhasePlaceholder>
    </PageShell>
  )
}
