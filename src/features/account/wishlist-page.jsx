import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/shared/empty-state'
import { PageShell } from '@/components/shared/page-shell'
import { Button } from '@/components/ui/button'

export function WishlistPage() {
  return (
    <PageShell title="Wishlist">
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Saving products is not implemented yet."
        action={
          <Button asChild variant="outline">
            <Link to="/collections">Browse collections</Link>
          </Button>
        }
      />
    </PageShell>
  )
}
