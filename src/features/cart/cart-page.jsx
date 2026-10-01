import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/shared/empty-state'
import { PageShell } from '@/components/shared/page-shell'
import { Button } from '@/components/ui/button'

export function CartPage() {
  return (
    <PageShell title="Your bag">
      <EmptyState
        icon={ShoppingBag}
        title="Your bag is empty"
        description="Cart functionality is not implemented yet. Browse the collections to see the catalogue shell."
        action={
          <Button asChild>
            <Link to="/collections">Continue shopping</Link>
          </Button>
        }
      />
    </PageShell>
  )
}
