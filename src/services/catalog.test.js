/**
 * Tests for the parts of the catalog layer that are easy to get wrong and
 * expensive to get wrong: price-unit conversion, deduplication, gallery
 * ordering, search, and the honesty constraints around ratings and stock.
 *
 * Rendering is not tested here — these are the data invariants the whole
 * storefront depends on.
 */
import { describe, expect, it } from 'vitest'

import { products as sourceProducts } from '@/data/products'
import {
  catalogCategories,
  catalogProducts,
  formatPrice,
  getProductBySlug,
  getProductsByCategory,
  searchProducts,
} from '@/services/catalog'
import { lineKey } from '@/features/cart/store-context'

describe('catalog integrity', () => {
  it('exposes every source product exactly once', () => {
    expect(catalogProducts).toHaveLength(sourceProducts.length)
    expect(new Set(catalogProducts.map((p) => p.id)).size).toBe(catalogProducts.length)
    expect(new Set(catalogProducts.map((p) => p.slug)).size).toBe(catalogProducts.length)
  })

  it('does not reintroduce the deduplicated HRX ankle-socks product', () => {
    const matches = catalogProducts.filter((p) => p.id === '31105932')
    expect(matches).toHaveLength(1)
  })

  it('assigns every product to one of the three canonical categories', () => {
    const slugs = new Set(catalogCategories.map((c) => c.slug))
    expect(slugs).toEqual(
      new Set([
        'women-sportswear-clothing',
        'women-sports-equipments',
        'women-sports-accessories',
      ]),
    )
    for (const product of catalogProducts) {
      expect(slugs.has(product.categorySlug)).toBe(true)
    }
  })

  it('reports category counts that match the products actually present', () => {
    for (const category of catalogCategories) {
      expect(category.count).toBe(getProductsByCategory(category.slug).length)
      expect(category.count).toBeGreaterThan(0)
    }
  })
})

describe('price normalisation', () => {
  it('converts whole rupees to paise exactly once', () => {
    for (const source of sourceProducts) {
      const product = getProductBySlug(source.slug)
      expect(product.pricePaise).toBe(source.price * 100)
    }
  })

  it('keeps every price a non-negative integer', () => {
    for (const product of catalogProducts) {
      expect(Number.isInteger(product.pricePaise)).toBe(true)
      expect(product.pricePaise).toBeGreaterThanOrEqual(0)
    }
  })

  it('only sets a compare-at price when the source price is genuinely higher', () => {
    for (const product of catalogProducts) {
      if (product.compareAtPaise !== null) {
        expect(product.compareAtPaise).toBeGreaterThan(product.pricePaise)
      }
    }
  })

  it('formats paise as whole rupees', () => {
    expect(formatPrice(79900)).toContain('799')
    expect(formatPrice(null)).toBeNull()
  })
})

describe('images', () => {
  it('gives every product a primary image that is also first in the gallery', () => {
    for (const product of catalogProducts) {
      expect(product.primaryImage).toBeTruthy()
      expect(product.images[0]).toBe(product.primaryImage)
      expect(product.primaryImage.alt).toBeTruthy()
    }
  })

  it('orders galleries front → model → side → back → detail', () => {
    const rank = { front: 0, model: 1, side: 2, back: 3, detail: 4 }
    for (const product of catalogProducts) {
      const ranked = product.images
        .map((image) => (image.view in rank ? rank[image.view] : 5))
        .filter((value) => value < 5)
      expect([...ranked].sort((a, b) => a - b)).toEqual(ranked)
    }
  })

  it('flags single-image products instead of fabricating gallery views', () => {
    for (const product of catalogProducts) {
      expect(product.hasSingleImage).toBe(product.images.length <= 1)
    }
  })
})

describe('honesty constraints', () => {
  it('never claims known stock', () => {
    for (const product of catalogProducts) {
      expect(product.availability).toBe('unknown')
    }
  })

  it('keeps scraped ratings distinguishable from FITNEX reviews', () => {
    for (const product of catalogProducts) {
      expect(product).not.toHaveProperty('rating')
      expect(product).not.toHaveProperty('reviews')
      if (product.sourceRating) {
        expect(product.sourceRating.origin).toBe('marketplace-listing')
      }
    }
  })
})

describe('search', () => {
  it('matches product names', () => {
    const results = searchProducts('jacket')
    expect(results.length).toBeGreaterThan(0)
    expect(
      results.every((p) =>
        `${p.name} ${p.brand} ${p.categoryLabel} ${p.sport} ${p.material}`
          .toLowerCase()
          .includes('jacket'),
      ),
    ).toBe(true)
  })

  it('narrows rather than widens as terms are added', () => {
    const broad = searchProducts('yonex', { limit: 100 })
    const narrow = searchProducts('yonex shuttlecocks', { limit: 100 })
    expect(narrow.length).toBeLessThanOrEqual(broad.length)
  })

  it('returns nothing for an empty query or no match', () => {
    expect(searchProducts('')).toEqual([])
    expect(searchProducts('   ')).toEqual([])
    expect(searchProducts('zzzzqqqnotathing')).toEqual([])
  })
})

describe('cart line identity', () => {
  it('treats different sizes of the same product as different lines', () => {
    const a = lineKey({ productId: '1', size: 'S', color: 'Black' })
    const b = lineKey({ productId: '1', size: 'M', color: 'Black' })
    expect(a).not.toBe(b)
  })

  it('treats different colours of the same product as different lines', () => {
    expect(lineKey({ productId: '1', size: 'S', color: 'Black' })).not.toBe(
      lineKey({ productId: '1', size: 'S', color: 'Pink' }),
    )
  })

  it('is stable for the same product and options', () => {
    expect(lineKey({ productId: '1', size: 'S', color: 'Black' })).toBe(
      lineKey({ productId: '1', size: 'S', color: 'Black' }),
    )
  })

  it('distinguishes an unset option from a set one', () => {
    expect(lineKey({ productId: '1' })).not.toBe(lineKey({ productId: '1', size: 'S' }))
  })
})
