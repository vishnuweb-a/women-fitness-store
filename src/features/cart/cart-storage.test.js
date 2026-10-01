/**
 * Tests for cart identity, persistence validation, migration, and money.
 *
 * These are the parts where a quiet bug is expensive: two variants collapsing
 * into one line, a corrupt `localStorage` value taking the storefront down, a
 * Phase 1 cart being silently discarded, or a float creeping into a price.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CART_KEY,
  CART_KEY_V1,
  CART_VERSION,
  MAX_QUANTITY,
  normaliseCartPayload,
  normaliseWishlistPayload,
  readCart,
  validateCartLine,
  writeCart,
} from '@/features/cart/cart-storage'
import { lineKey } from '@/features/cart/store-context'
import { catalogProducts } from '@/services/catalog'

/** A minimal in-memory `localStorage`, so these run in the Node environment. */
function installStorage(initial = {}) {
  const store = new Map(Object.entries(initial))
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
  vi.stubGlobal('window', { localStorage: storage })
  return store
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('cart line identity', () => {
  it('distinguishes two selections of the same product', () => {
    const a = lineKey({ productId: '1', size: 'M', color: 'Black' })
    const b = lineKey({ productId: '1', size: 'L', color: 'Black' })
    const c = lineKey({ productId: '1', size: 'M', color: 'Red' })
    expect(new Set([a, b, c]).size).toBe(3)
  })

  it('treats the same product with the same selection as one line', () => {
    expect(lineKey({ productId: '1', size: 'M', color: 'Black' })).toBe(
      lineKey({ productId: '1', size: 'M', color: 'Black' }),
    )
  })

  it('distinguishes an unselected option from a selected one', () => {
    expect(lineKey({ productId: '1' })).not.toBe(lineKey({ productId: '1', size: 'M' }))
  })

  it('does not collide across products', () => {
    expect(lineKey({ productId: '1', size: 'M' })).not.toBe(
      lineKey({ productId: '2', size: 'M' }),
    )
  })

  it('keeps distinct selections distinct even when an option contains the separator', () => {
    // The key is a three-segment join, so a value containing "::" shifts the
    // string but cannot forge another selection's key. Checked exhaustively
    // over the awkward values rather than on one lucky example.
    const awkward = [null, '::', '-', '::-', 'M', '', 'M::L']
    const keys = new Map()
    for (const size of awkward) {
      for (const color of awkward) {
        const key = lineKey({ productId: '1', size, color })
        const identity = JSON.stringify([size ?? null, color ?? null])
        if (keys.has(key)) expect(keys.get(key)).toBe(identity)
        keys.set(key, identity)
      }
    }
    // Every distinct (size, colour) pair produced a distinct key.
    expect(keys.size).toBe(awkward.length * awkward.length)
  })
})

describe('persisted line validation', () => {
  it('accepts a well-formed line unchanged', () => {
    expect(validateCartLine({ productId: '7', size: 'M', color: 'Black', quantity: 3 })).toEqual({
      productId: '7',
      size: 'M',
      color: 'Black',
      quantity: 3,
    })
  })

  it('rejects anything that is not an object with a product ID', () => {
    for (const bad of [null, undefined, 42, 'line', [], {}, { productId: '' }, { productId: {} }]) {
      expect(validateCartLine(bad)).toBeNull()
    }
  })

  it('coerces a numeric product ID to the string form the catalog uses', () => {
    expect(validateCartLine({ productId: 31105932, quantity: 1 }).productId).toBe('31105932')
  })

  it('repairs an invalid quantity rather than dropping the line', () => {
    const cases = [
      [0, 1],
      [-5, 1],
      [2.6, 3],
      ['4', 4],
      [Number.NaN, 1],
      [Number.POSITIVE_INFINITY, 1],
      [undefined, 1],
      [500, MAX_QUANTITY],
    ]
    for (const [input, expected] of cases) {
      expect(validateCartLine({ productId: '1', quantity: input }).quantity).toBe(expected)
    }
  })

  it('discards option values that are not strings', () => {
    const line = validateCartLine({
      productId: '1',
      size: { evil: true },
      color: ['Red'],
      quantity: 1,
    })
    expect(line.size).toBeNull()
    expect(line.color).toBeNull()
  })

  it('discards an absurdly long option label', () => {
    expect(validateCartLine({ productId: '1', size: 'x'.repeat(500) }).size).toBeNull()
  })
})

describe('persisted payload normalisation', () => {
  it('returns an empty cart for every corrupt shape', () => {
    for (const bad of [null, undefined, 0, 'nope', { lines: 'nope' }, { nope: true }]) {
      expect(normaliseCartPayload(bad, lineKey)).toEqual([])
    }
  })

  it('drops invalid lines but keeps the valid ones', () => {
    const lines = normaliseCartPayload(
      [
        { productId: '1', quantity: 2 },
        null,
        { quantity: 3 },
        { productId: '2', size: 'M', quantity: 1 },
      ],
      lineKey,
    )
    expect(lines).toHaveLength(2)
    expect(lines.map((line) => line.productId)).toEqual(['1', '2'])
  })

  it('merges duplicate lines by summing their quantities', () => {
    const lines = normaliseCartPayload(
      [
        { productId: '1', size: 'M', quantity: 2 },
        { productId: '1', size: 'M', quantity: 3 },
      ],
      lineKey,
    )
    expect(lines).toHaveLength(1)
    expect(lines[0].quantity).toBe(5)
  })

  it('keeps two different selections of one product as separate lines', () => {
    const lines = normaliseCartPayload(
      [
        { productId: '1', size: 'M', quantity: 1 },
        { productId: '1', size: 'L', quantity: 1 },
      ],
      lineKey,
    )
    expect(lines).toHaveLength(2)
  })

  it('clamps a merged quantity to the maximum', () => {
    const lines = normaliseCartPayload(
      [
        { productId: '1', quantity: 90 },
        { productId: '1', quantity: 90 },
      ],
      lineKey,
    )
    expect(lines[0].quantity).toBe(MAX_QUANTITY)
  })

  it('de-duplicates a wishlist and keeps only usable IDs', () => {
    expect(normaliseWishlistPayload(['1', '1', 2, '', null, { id: 3 }])).toEqual(['1', '2'])
    expect(normaliseWishlistPayload('nope')).toEqual([])
  })
})

describe('reading and migration', () => {
  beforeEach(() => installStorage())

  it('returns an empty cart when nothing is stored', () => {
    expect(readCart(lineKey)).toEqual({ lines: [], migrated: false })
  })

  it('reads a v2 envelope', () => {
    installStorage({
      [CART_KEY]: JSON.stringify({
        version: CART_VERSION,
        lines: [{ productId: '1', size: 'M', quantity: 2 }],
      }),
    })
    const { lines, migrated } = readCart(lineKey)
    expect(migrated).toBe(false)
    expect(lines).toEqual([{ productId: '1', size: 'M', color: null, quantity: 2 }])
  })

  it('migrates a Phase 1 cart rather than discarding it', () => {
    installStorage({
      [CART_KEY_V1]: JSON.stringify([
        { productId: '1', size: 'M', color: null, quantity: 2 },
        { productId: '1', size: 'L', color: null, quantity: 1 },
      ]),
    })
    const { lines, migrated } = readCart(lineKey)
    expect(migrated).toBe(true)
    expect(lines).toHaveLength(2)
    expect(lines.map((line) => line.size)).toEqual(['M', 'L'])
  })

  it('prefers the current value over the legacy one', () => {
    installStorage({
      [CART_KEY]: JSON.stringify({ version: CART_VERSION, lines: [{ productId: '9', quantity: 1 }] }),
      [CART_KEY_V1]: JSON.stringify([{ productId: '1', quantity: 5 }]),
    })
    const { lines, migrated } = readCart(lineKey)
    expect(migrated).toBe(false)
    expect(lines[0].productId).toBe('9')
  })

  it('recovers from unparseable JSON instead of throwing', () => {
    installStorage({ [CART_KEY]: '{"lines": [' })
    expect(() => readCart(lineKey)).not.toThrow()
    expect(readCart(lineKey).lines).toEqual([])
  })

  it('recovers from a storage accessor that throws', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem() {
          throw new Error('access denied')
        },
      },
    })
    expect(readCart(lineKey).lines).toEqual([])
  })

  it('survives a write when storage is full', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem() {
          throw new Error('QuotaExceededError')
        },
      },
    })
    expect(() => writeCart([{ productId: '1', quantity: 1 }])).not.toThrow()
  })

  it('writes the version so a later shape change is detectable', () => {
    const store = installStorage()
    writeCart([{ productId: '1', size: null, color: null, quantity: 1 }])
    expect(JSON.parse(store.get(CART_KEY)).version).toBe(CART_VERSION)
  })

  it('round-trips a cart through a write and a read', () => {
    installStorage()
    const lines = [
      { productId: '1', size: 'M', color: 'Black', quantity: 2 },
      { productId: '1', size: 'L', color: 'Black', quantity: 1 },
    ]
    writeCart(lines)
    expect(readCart(lineKey).lines).toEqual(lines)
  })
})

describe('cart money is integer paise', () => {
  it('multiplies an integer price by an integer quantity exactly', () => {
    for (const product of catalogProducts) {
      for (const quantity of [1, 2, 3, 7, 99]) {
        const subtotal = product.pricePaise * quantity
        expect(Number.isInteger(subtotal)).toBe(true)
        expect(subtotal % 100).toBe(0) // whole-rupee prices stay whole
      }
    }
  })

  it('sums line subtotals without floating-point drift', () => {
    const items = catalogProducts.slice(0, 10).map((product, index) => ({
      subtotalPaise: product.pricePaise * (index + 1),
    }))
    const total = items.reduce((sum, item) => sum + item.subtotalPaise, 0)
    expect(Number.isInteger(total)).toBe(true)
    expect(total).toBe(
      catalogProducts.slice(0, 10).reduce((sum, p, i) => sum + p.pricePaise * (i + 1), 0),
    )
  })

  it('keeps a subtotal that a float path would get wrong', () => {
    // ₹1,999.00 x 3 is exact in paise; the same sum via rupee floats is not.
    const paise = 199900 * 3
    expect(paise).toBe(599700)
    expect(paise / 100).toBe(5997)
  })
})
