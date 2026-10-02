/**
 * Local cart and wishlist state.
 *
 * This is **browser-local only**. Nothing is sent to a server, nothing is
 * reserved, and no stock is held — the catalog carries no inventory data at
 * all. The UI must never imply otherwise.
 *
 * Persistence stores only what cannot be derived: product IDs, the selected
 * option labels, and quantities. Names, prices, and images are always looked
 * up from the catalog at render time, so a catalog change is reflected
 * immediately and a stale price can never be shown. Reading, validating, and
 * migrating that stored value is `cart-storage.js`.
 *
 * Cart identity is the product ID plus the selected size and colour, so the
 * same product in two sizes is two lines.
 *
 * A line whose product is no longer in the catalog is kept in storage but is
 * reported separately as an "unavailable" line rather than being rendered as a
 * priced item or silently deleted — the person can see what happened and
 * remove it themselves.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  readCart,
  readWishlist,
  writeCart,
  writeWishlist,
  MAX_QUANTITY,
} from '@/features/cart/cart-storage'
import { lineKey, StoreContext } from '@/features/cart/store-context'
import { getProductById } from '@/services/catalog'

export function StoreProvider({ children }) {
  const [cartLines, setCartLines] = useState(() => readCart(lineKey).lines)
  const [wishlistIds, setWishlistIds] = useState(() => readWishlist())

  useEffect(() => writeCart(cartLines), [cartLines])
  useEffect(() => writeWishlist(wishlistIds), [wishlistIds])

  const addToCart = useCallback(({ productId, size = null, color = null, quantity = 1 }) => {
    const amount = Number.isFinite(quantity) ? Math.max(1, Math.round(quantity)) : 1
    const key = lineKey({ productId, size, color })

    setCartLines((lines) => {
      const existing = lines.find((line) => lineKey(line) === key)
      if (existing) {
        return lines.map((line) =>
          lineKey(line) === key
            ? { ...line, quantity: Math.min(line.quantity + amount, MAX_QUANTITY) }
            : line,
        )
      }
      return [
        ...lines,
        {
          productId: String(productId),
          size: size ?? null,
          color: color ?? null,
          quantity: Math.min(amount, MAX_QUANTITY),
        },
      ]
    })
  }, [])

  const removeFromCart = useCallback((key) => {
    setCartLines((lines) => lines.filter((line) => lineKey(line) !== key))
  }, [])

  const setQuantity = useCallback((key, quantity) => {
    const next = Number.isFinite(quantity)
      ? Math.max(0, Math.min(Math.round(quantity), MAX_QUANTITY))
      : 1
    setCartLines((lines) =>
      next === 0
        ? lines.filter((line) => lineKey(line) !== key)
        : lines.map((line) => (lineKey(line) === key ? { ...line, quantity: next } : line)),
    )
  }, [])

  const toggleWishlist = useCallback((productId) => {
    const id = String(productId)
    setWishlistIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }, [])

  /**
   * Remove a saved product unconditionally.
   *
   * Distinct from `toggleWishlist`: the wishlist page's remove action must
   * remove, never re-add. Toggling an id that is somehow absent would silently
   * save it instead, which is the opposite of what the button says.
   */
  const removeFromWishlist = useCallback((productId) => {
    const id = String(productId)
    setWishlistIds((ids) => ids.filter((x) => x !== id))
  }, [])

  const isWishlisted = useCallback(
    (productId) => wishlistIds.includes(String(productId)),
    [wishlistIds],
  )

  /**
   * Move a line to the wishlist: save the product, then drop the line.
   *
   * The wishlist holds products, not variants, so the selected size and colour
   * are intentionally not carried over — there is nowhere honest to put them.
   */
  const moveToWishlist = useCallback((key) => {
    setCartLines((lines) => {
      const line = lines.find((entry) => lineKey(entry) === key)
      if (line) {
        const id = String(line.productId)
        setWishlistIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
      }
      return lines.filter((entry) => lineKey(entry) !== key)
    })
  }, [])

  const clearCart = useCallback(() => setCartLines([]), [])

  // Display data is derived from the catalog, never from storage.
  const { cartItems, unavailableItems } = useMemo(() => {
    const items = []
    const unavailable = []

    for (const line of cartLines) {
      const key = lineKey(line)
      const product = getProductById(line.productId)

      if (!product) {
        unavailable.push({ key, line, quantity: line.quantity })
        continue
      }

      const unitPaise = product.pricePaise ?? 0
      items.push({
        key,
        line,
        product,
        quantity: line.quantity,
        unitPaise,
        // Integer paise throughout: an integer price times an integer
        // quantity stays exact. No float arithmetic touches a money value.
        subtotalPaise: unitPaise * line.quantity,
      })
    }

    return { cartItems: items, unavailableItems: unavailable }
  }, [cartLines])

  /**
   * Wishlist display data, derived from the catalog like the cart's.
   *
   * A saved id whose product has left the catalog is reported separately as
   * an "unavailable" entry rather than silently vanishing from the list. The
   * person saved it deliberately, so the page can say what happened and offer
   * to remove it — the same contract the cart gives an unavailable line.
   */
  const { wishlistItems, unavailableWishlistIds } = useMemo(() => {
    const items = []
    const missing = []

    for (const id of wishlistIds) {
      const product = getProductById(id)
      if (product) items.push(product)
      else missing.push(id)
    }

    return { wishlistItems: items, unavailableWishlistIds: missing }
  }, [wishlistIds])

  const value = useMemo(
    () => ({
      cartItems,
      unavailableItems,
      // The header badge counts units of real products, so it always matches
      // what the cart page prices.
      cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
      cartSubtotalPaise: cartItems.reduce((total, item) => total + item.subtotalPaise, 0),
      addToCart,
      removeFromCart,
      setQuantity,
      moveToWishlist,
      clearCart,
      wishlistItems,
      unavailableWishlistIds,
      // Counts products that can actually be shown, so the header badge
      // always matches what the wishlist page renders as a card.
      wishlistCount: wishlistItems.length,
      toggleWishlist,
      isWishlisted,
      removeFromWishlist,
    }),
    [
      cartItems,
      unavailableItems,
      wishlistItems,
      unavailableWishlistIds,
      addToCart,
      removeFromCart,
      setQuantity,
      moveToWishlist,
      clearCart,
      toggleWishlist,
      isWishlisted,
      removeFromWishlist,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
