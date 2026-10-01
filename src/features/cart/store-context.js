/**
 * Shared internals for the cart/wishlist store.
 *
 * `cart-store.jsx` exports only components, so Fast Refresh keeps working;
 * the context object and the line-identity helper live here instead.
 */
import { createContext } from 'react'

export const StoreContext = createContext(null)

/**
 * Stable line identity: the product plus the options that distinguish a
 * variant. The same product in two sizes is therefore two cart lines.
 */
export function lineKey({ productId, size = null, color = null }) {
  return [productId, size ?? '-', color ?? '-'].join('::')
}
