/**
 * In-memory state for the demo checkout.
 *
 * Mounted above the router in `providers.jsx`, so a draft survives navigation
 * between `/checkout` and `/checkout/payment` and on to the confirmation page
 * without ever touching persistent storage.
 *
 * **Nothing here is persisted.** No `localStorage`, no `sessionStorage`, no
 * URL parameter, no cookie, no analytics call, no `console` output carries a
 * contact or address value. A reload loses the draft on purpose; the guarded
 * steps explain that and send the person back to the step they can complete.
 */
import { useCallback, useMemo, useReducer } from 'react'

import { CheckoutContext } from '@/features/checkout/checkout-context'
import {
  buildDemoSnapshot,
  checkoutReducer,
  createDemoReference,
  initialCheckoutState,
} from '@/features/checkout/checkout-state'

export function CheckoutProvider({ children }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialCheckoutState)

  const setDelivery = useCallback((delivery, signature) => {
    dispatch({ type: 'set-delivery', delivery, cartSignature: signature })
  }, [])

  const setPayment = useCallback((billing, paymentMethod) => {
    dispatch({ type: 'set-payment', billing, paymentMethod })
  }, [])

  const acknowledgeCartChange = useCallback((signature) => {
    dispatch({ type: 'acknowledge-cart-change', cartSignature: signature })
  }, [])

  const resetDraft = useCallback(() => dispatch({ type: 'reset-draft' }), [])

  /**
   * Record a completed demo checkout and return its reference.
   *
   * The caller navigates to `/orders/<reference>/confirmation`. The real cart
   * is deliberately **not** cleared: no order was placed, so emptying someone's
   * bag would be destroying their work over a demonstration.
   */
  const completeDemoCheckout = useCallback((input) => {
    const reference = createDemoReference()
    const snapshot = buildDemoSnapshot({ reference, ...input })
    dispatch({ type: 'complete', snapshot })
    return snapshot
  }, [])

  const getSnapshot = useCallback(
    (reference) => state.completed[reference] ?? null,
    [state.completed],
  )

  const value = useMemo(
    () => ({
      state,
      setDelivery,
      setPayment,
      acknowledgeCartChange,
      resetDraft,
      completeDemoCheckout,
      getSnapshot,
    }),
    [
      state,
      setDelivery,
      setPayment,
      acknowledgeCartChange,
      resetDraft,
      completeDemoCheckout,
      getSnapshot,
    ],
  )

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}
