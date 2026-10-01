import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/shared/empty-state'
import { PageShell } from '@/components/shared/page-shell'
import { ProductGrid } from '@/components/shared/product-grid'
import { Button } from '@/components/ui/button'
import { useStore } from '@/features/cart/use-store'

/**
 * Saved products.
 *
 * Backed by the same browser-local store as the header's heart buttons, so a
 * product saved from a grid appears here and survives a reload.
 */
export function WishlistPage() {
  const { wishlistItems } = useStore()

  return (
    <PageShell
      title="Wishlist"
      description="Products you have saved in this browser."
    >
      {wishlistItems.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Select the heart on any product to save it here."
          action={
            <Button asChild variant="outline" className="mt-2">
              <Link to="/collections">Browse the catalog</Link>
            </Button>
          }
        />
      ) : (
        <ProductGrid products={wishlistItems} />
      )}
    </PageShell>
  )
}
