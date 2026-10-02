/**
 * Tests for the wishlist's storage compatibility and its handling of
 * products that are no longer in the catalog.
 *
 * Two properties are under test:
 *
 *   1. **Compatibility.** A wishlist written before this phase still loads.
 *      The stored shape is a plain array of product-id strings under
 *      `fitnex:wishlist:v1`, and the polished page must not have changed it —
 *      a format change here would silently empty someone's saved list.
 *   2. **Unavailable products.** An id whose product has left the catalog is
 *      reported rather than silently dropped, so the page can explain what
 *      happened and offer to remove it.
 */
import { describe, expect, it } from 'vitest'

import { normaliseWishlistPayload, WISHLIST_KEY } from '@/features/cart/cart-storage'
import { requiresOptionChoice } from '@/features/account/wishlist-options'
import { catalogProducts, getProductById } from '@/services/catalog'

/**
 * The derivation the store performs: split saved ids into products that can
 * be rendered and ids that cannot.
 *
 * Mirrors `cart-store.jsx` so the rule is testable without a DOM. The store
 * and this helper must agree; if the store's split changes, this test should
 * be updated alongside it.
 */
function splitWishlist(ids) {
  const items = []
  const missing = []
  for (const id of ids) {
    const product = getProductById(id)
    if (product) items.push(product)
    else missing.push(id)
  }
  return { items, missing }
}

describe('wishlist storage compatibility', () => {
  it('still uses the Phase 1 storage key', () => {
    // Changing this key would orphan every wishlist already saved in a
    // visitor's browser.
    expect(WISHLIST_KEY).toBe('fitnex:wishlist:v1')
  })

  it('loads a wishlist stored as a plain array of id strings', () => {
    const stored = JSON.parse(JSON.stringify(['31105932', '1']))
    expect(normaliseWishlistPayload(stored)).toEqual(['31105932', '1'])
  })

  it('accepts numeric ids written by an older build', () => {
    expect(normaliseWishlistPayload([31105932])).toEqual(['31105932'])
  })

  it('preserves the saved order', () => {
    const ids = catalogProducts.slice(0, 3).map((product) => product.id)
    expect(normaliseWishlistPayload(ids)).toEqual(ids)
  })

  it('recovers from a corrupt stored value rather than throwing', () => {
    expect(normaliseWishlistPayload('not an array')).toEqual([])
    expect(normaliseWishlistPayload(null)).toEqual([])
    expect(normaliseWishlistPayload({ ids: ['1'] })).toEqual([])
  })

  it('drops junk entries but keeps the usable ones around them', () => {
    const real = catalogProducts[0].id
    expect(normaliseWishlistPayload([null, real, { id: 'x' }, '', real])).toEqual([real])
  })
})

describe('wishlist products that are no longer in the catalog', () => {
  it('renders a saved product that still exists', () => {
    const existing = catalogProducts[0].id
    const { items, missing } = splitWishlist([existing])

    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(existing)
    expect(missing).toEqual([])
  })

  /**
   * The behaviour that changed this phase. Previously an unknown id was
   * filtered away and the person was never told their saved product had
   * gone; now it is reported so the page can offer to remove it.
   */
  it('reports an unknown id as unavailable instead of dropping it', () => {
    const { items, missing } = splitWishlist(['not-a-real-product-id'])

    expect(items).toEqual([])
    expect(missing).toEqual(['not-a-real-product-id'])
  })

  it('keeps the available products when some are unavailable', () => {
    const existing = catalogProducts[0].id
    const { items, missing } = splitWishlist([existing, 'gone-from-catalog'])

    expect(items.map((product) => product.id)).toEqual([existing])
    expect(missing).toEqual(['gone-from-catalog'])
  })

  it('counts only renderable products, so the header badge matches the page', () => {
    const existing = catalogProducts[0].id
    const { items } = splitWishlist([existing, 'gone-from-catalog'])
    expect(items).toHaveLength(1)
  })
})

describe('requiresOptionChoice', () => {
  it('requires a choice when a clothing product lists several sizes', () => {
    expect(
      requiresOptionChoice({ productType: 'clothing', sizes: ['S', 'M'], colors: [] }),
    ).toBe(true)
  })

  it('requires a choice when a product lists several colours', () => {
    expect(
      requiresOptionChoice({ productType: 'accessory', sizes: [], colors: ['Red', 'Blue'] }),
    ).toBe(true)
  })

  it('needs no choice for a single listed option', () => {
    expect(
      requiresOptionChoice({ productType: 'clothing', sizes: ['M'], colors: ['Red'] }),
    ).toBe(false)
  })

  it('needs no choice when nothing is listed', () => {
    expect(requiresOptionChoice({ productType: 'accessory', sizes: [], colors: [] })).toBe(false)
  })

  /**
   * Equipment is not sized in this catalog, so several listed sizes on an
   * accessory do not force a choice — exactly the rule the product page
   * applies. The two must not disagree about whether a size is required.
   */
  it('matches the product page rule for a non-clothing product with several sizes', () => {
    expect(
      requiresOptionChoice({ productType: 'accessory', sizes: ['S', 'M'], colors: [] }),
    ).toBe(false)
  })

  it('agrees with the product page rule across the real catalog', () => {
    for (const product of catalogProducts) {
      const pageRule =
        (product.productType === 'clothing' && product.sizes.length > 1) ||
        product.colors.length > 1
      expect(requiresOptionChoice(product)).toBe(pageRule)
    }
  })
})
