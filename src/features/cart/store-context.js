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
 *
 * Each segment is JSON-encoded before joining, so an option label can never be
 * confused with the "no option selected" marker or with a segment boundary.
 * Encoding `null` as a bare `-` (as an earlier version did) made a product
 * whose colour is literally named "-" share a line with one that has no colour
 * selected; `JSON.stringify` distinguishes `null` from `"-"`, and escapes any
 * quote or separator inside a label.
 */
export function lineKey({ productId, size = null, color = null }) {
  return [productId, size ?? null, color ?? null].map((part) => JSON.stringify(part)).join('::')
}
