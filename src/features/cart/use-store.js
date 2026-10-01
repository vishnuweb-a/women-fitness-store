import { useContext } from 'react'

import { StoreContext } from '@/features/cart/store-context'

/**
 * Access the browser-local cart and wishlist.
 *
 * Must be called inside `StoreProvider` (mounted in `src/app/providers.jsx`).
 */
export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within a StoreProvider')
  return context
}
