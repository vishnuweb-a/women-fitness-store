/**
 * Context object for the checkout draft.
 *
 * Split out from the provider component so `checkout-provider.jsx` exports
 * only components and Fast Refresh keeps working — the same split as
 * `store-context.js`.
 */
import { createContext } from 'react'

export const CheckoutContext = createContext(null)
