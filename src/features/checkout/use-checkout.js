import { useContext, useMemo } from 'react'

import { CheckoutContext } from '@/features/checkout/checkout-context'
import { cartSignature, isReviewStale } from '@/features/checkout/checkout-state'
import { useStore } from '@/features/cart/use-store'

/**
 * Access the in-memory checkout draft.
 *
 * Must be called inside `CheckoutProvider` (mounted in `src/app/providers.jsx`).
 */
export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) throw new Error('useCheckout must be used within a CheckoutProvider')
  return context
}

/**
 * The checkout draft joined to the live cart.
 *
 * `signature` fingerprints the cart as it is right now; `reviewStale` is true
 * when it no longer matches what the delivery step was completed against. The
 * review and completion steps read `reviewStale` to require a fresh look
 * before a demo checkout can finish.
 */
export function useCheckoutSession() {
  const checkout = useCheckout()
  const { cartItems, unavailableItems, cartCount, cartSubtotalPaise } = useStore()

  const signature = useMemo(() => cartSignature(cartItems), [cartItems])

  return {
    ...checkout,
    cartItems,
    unavailableItems,
    cartCount,
    cartSubtotalPaise,
    signature,
    hasCartItems: cartItems.length > 0,
    reviewStale: isReviewStale({ state: checkout.state, signature }),
  }
}
