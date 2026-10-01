/**
 * Local cart and wishlist state.
 *
 * This is **browser-local only**. Nothing is sent to a server, nothing is
 * reserved, and no stock is held — the catalog carries no inventory data at
 * all. The UI must never imply otherwise.
 *
 * Persistence stores only what cannot be derived: product IDs, the selected
 * options, and quantities. Names, prices, and images are always looked up from
 * the catalog at render time, so a catalog change is reflected immediately and
 * a stale price can never be shown.
 *
 * Cart identity is the product ID plus the selected size and colour, so the
 * same product in two sizes is two lines.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'

import { lineKey, StoreContext } from '@/features/cart/store-context'
import { getProductById } from '@/services/catalog'

const CART_KEY = 'fitnex:cart:v1'
const WISHLIST_KEY = 'fitnex:wishlist:v1'

/** Read a JSON array from localStorage, tolerating absence and corruption. */
function readStored(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function writeStored(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private browsing or a full quota — the cart still works for this session.
  }
}

export function StoreProvider({ children }) {
  const [cartLines, setCartLines] = useState(() => readStored(CART_KEY, []))
  const [wishlistIds, setWishlistIds] = useState(() => readStored(WISHLIST_KEY, []))

  useEffect(() => writeStored(CART_KEY, cartLines), [cartLines])
  useEffect(() => writeStored(WISHLIST_KEY, wishlistIds), [wishlistIds])

  const addToCart = useCallback(({ productId, size = null, color = null, quantity = 1 }) => {
    const key = lineKey({ productId, size, color })
    setCartLines((lines) => {
      const existing = lines.find((line) => lineKey(line) === key)
      if (existing) {
        return lines.map((line) =>
          lineKey(line) === key
            ? { ...line, quantity: Math.min(line.quantity + quantity, 99) }
            : line,
        )
      }
      return [...lines, { productId: String(productId), size, color, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((key) => {
    setCartLines((lines) => lines.filter((line) => lineKey(line) !== key))
  }, [])

  const setQuantity = useCallback((key, quantity) => {
    const next = Math.max(0, Math.min(Math.round(quantity), 99))
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

  const isWishlisted = useCallback(
    (productId) => wishlistIds.includes(String(productId)),
    [wishlistIds],
  )

  // Display data is derived from the catalog, never from storage.
  const cartItems = useMemo(
    () =>
      cartLines
        .map((line) => {
          const product = getProductById(line.productId)
          if (!product) return null
          const unitPaise = product.pricePaise ?? 0
          return {
            key: lineKey(line),
            line,
            product,
            quantity: line.quantity,
            unitPaise,
            subtotalPaise: unitPaise * line.quantity,
          }
        })
        .filter(Boolean),
    [cartLines],
  )

  const wishlistItems = useMemo(
    () => wishlistIds.map((id) => getProductById(id)).filter(Boolean),
    [wishlistIds],
  )

  const value = useMemo(
    () => ({
      cartItems,
      cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
      cartSubtotalPaise: cartItems.reduce((total, item) => total + item.subtotalPaise, 0),
      addToCart,
      removeFromCart,
      setQuantity,
      wishlistItems,
      wishlistCount: wishlistItems.length,
      toggleWishlist,
      isWishlisted,
    }),
    [
      cartItems,
      wishlistItems,
      addToCart,
      removeFromCart,
      setQuantity,
      toggleWishlist,
      isWishlisted,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
