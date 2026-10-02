/**
 * Context object for the session-only customer previews.
 *
 * Split out from the provider component so `customer-provider.jsx` exports
 * only components and Fast Refresh keeps working — the same split as
 * `store-context.js` and `checkout-context.js`.
 */
import { createContext } from 'react'

export const CustomerContext = createContext(null)
