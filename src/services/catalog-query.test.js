/**
 * Tests for the listing contract: parameter normalisation, filtering, total
 * ordering, pagination, and the URL round-trip.
 *
 * These cover the behaviour a shared or reloaded collection URL depends on,
 * and the failure modes that are easy to introduce and hard to notice: a sort
 * that is not total, a filter change that leaves you on a page that no longer
 * exists, and a hand-edited parameter that reaches the filter untouched.
 */
import { describe, expect, it } from 'vitest'

import { catalogProducts } from '@/services/catalog'
import {
  buildListingParams,
  clearListingFilters,
  DEFAULT_SORT,
  filterProducts,
  getRelatedProducts,
  PAGE_SIZE,
  parseListingParams,
  PRICE_BRACKETS,
  runListingQuery,
  sortProducts,
  toggleListingValue,
  withListingChange,
} from '@/services/catalog-query'

/** Parse a query string the way the listing route does. */
const parse = (search, options) => parseListingParams(new URLSearchParams(search), options)

describe('parameter normalisation', () => {
  it('defaults to an unfiltered first page in catalog order', () => {
    const state = parse('')
    expect(state).toMatchObject({
      query: '',
      categories: [],
      brands: [],
      prices: [],
      sizes: [],
      colors: [],
      sort: DEFAULT_SORT,
      page: 1,
    })
  })

  it('drops unknown categories, brands, price brackets, and sorts', () => {
    const state = parse(
      'category=not-a-category&brand=NotABrand&price=free&size=XXXXL&color=plaid&sort=cheapest',
    )
    expect(state.categories).toEqual([])
    expect(state.brands).toEqual([])
    expect(state.prices).toEqual([])
    expect(state.sizes).toEqual([])
    expect(state.colors).toEqual([])
    expect(state.sort).toBe(DEFAULT_SORT)
  })

  it('keeps known values and de-duplicates repeats', () => {
    const state = parse(
      'category=women-sports-equipments&category=women-sports-equipments&sort=price-asc',
    )
    expect(state.categories).toEqual(['women-sports-equipments'])
    expect(state.sort).toBe('price-asc')
  })

  it('accepts both repeated keys and comma-separated lists', () => {
    const repeated = parse('category=women-sports-equipments&category=women-sports-accessories')
    const commas = parse('category=women-sports-equipments,women-sports-accessories')
    expect(commas.categories).toEqual(repeated.categories)
  })

  it('normalises an invalid page to 1', () => {
    for (const bad of ['0', '-4', 'abc', '1.5', '', 'NaN', 'Infinity']) {
      expect(parse(`page=${bad}`).page).toBe(1)
    }
    expect(parse('page=3').page).toBe(3)
  })

  it('pins the category and ignores the category param when scoped', () => {
    const state = parse('category=women-sports-accessories', {
      scopeCategory: 'women-sports-equipments',
    })
    expect(state.categories).toEqual(['women-sports-equipments'])
    expect(state.scopeCategory).toBe('women-sports-equipments')
  })

  it('caps an over-long query rather than passing it through', () => {
    const state = parse(`q=${'a'.repeat(500)}`)
    expect(state.query).toHaveLength(100)
  })
})

describe('filtering', () => {
  it('filters by category', () => {
    const state = parse('category=women-sports-equipments')
    const result = filterProducts(state)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((p) => p.categorySlug === 'women-sports-equipments')).toBe(true)
  })

  it('treats multiple values within one filter as OR', () => {
    const one = filterProducts(parse('category=women-sports-equipments')).length
    const two = filterProducts(parse('category=women-sports-accessories')).length
    const both = filterProducts(
      parse('category=women-sports-equipments&category=women-sports-accessories'),
    ).length
    expect(both).toBe(one + two)
  })

  it('treats different filters as AND', () => {
    const brand = catalogProducts.find((p) => p.brand)?.brand
    const state = parse(
      `category=women-sports-equipments&brand=${encodeURIComponent(brand)}`,
    )
    const result = filterProducts(state)
    expect(
      result.every(
        (p) => p.categorySlug === 'women-sports-equipments' && p.brand === brand,
      ),
    ).toBe(true)
  })

  it('keeps every product inside its selected price bracket', () => {
    for (const bracket of PRICE_BRACKETS) {
      const result = filterProducts(parse(`price=${bracket.value}`))
      for (const product of result) {
        expect(product.pricePaise).toBeGreaterThanOrEqual(bracket.min)
        if (bracket.max != null) expect(product.pricePaise).toBeLessThanOrEqual(bracket.max)
      }
    }
  })

  it('covers the whole catalog across all price brackets exactly once', () => {
    const counts = PRICE_BRACKETS.map(
      (bracket) => filterProducts(parse(`price=${bracket.value}`)).length,
    )
    expect(counts.reduce((a, b) => a + b, 0)).toBe(catalogProducts.length)
  })

  it('matches products that list a selected size', () => {
    const sized = catalogProducts.find((p) => p.sizes.length > 0)
    const size = sized.sizes[0]
    const result = filterProducts(parse(`size=${encodeURIComponent(size)}`))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((p) => p.sizes.includes(size))).toBe(true)
  })

  it('matches a size case-insensitively and canonicalises it', () => {
    const sized = catalogProducts.find((p) => p.sizes.length > 0)
    const size = sized.sizes[0]
    const state = parse(`size=${encodeURIComponent(size.toLowerCase())}`)
    expect(state.sizes).toEqual([size])
  })
})

describe('sorting', () => {
  it('sorts by price ascending and descending', () => {
    const asc = sortProducts(catalogProducts, 'price-asc').map((p) => p.pricePaise)
    const desc = sortProducts(catalogProducts, 'price-desc').map((p) => p.pricePaise)
    expect([...asc].sort((a, b) => a - b)).toEqual(asc)
    expect([...desc].sort((a, b) => b - a)).toEqual(desc)
  })

  it('sorts by name in both directions', () => {
    const asc = sortProducts(catalogProducts, 'name-asc').map((p) => p.name)
    expect([...asc].sort((a, b) => a.localeCompare(b))).toEqual(asc)
    const desc = sortProducts(catalogProducts, 'name-desc').map((p) => p.name)
    expect(desc[0]).toBe(asc[asc.length - 1])
  })

  it('is deterministic: the same sort twice produces the same order', () => {
    for (const sort of ['featured', 'price-asc', 'price-desc', 'name-asc', 'name-desc']) {
      const first = sortProducts(catalogProducts, sort).map((p) => p.slug)
      const second = sortProducts([...catalogProducts].reverse(), sort).map((p) => p.slug)
      expect(second).toEqual(first)
    }
  })

  it('does not mutate the array it is given', () => {
    const input = catalogProducts.slice(0, 5)
    const before = input.map((p) => p.slug)
    sortProducts(input, 'price-desc')
    expect(input.map((p) => p.slug)).toEqual(before)
  })

  it('breaks price ties by slug so equal prices never reorder', () => {
    const sorted = sortProducts(catalogProducts, 'price-asc')
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].pricePaise === sorted[i - 1].pricePaise) {
        expect(sorted[i - 1].slug.localeCompare(sorted[i].slug)).toBeLessThan(0)
      }
    }
  })
})

describe('pagination', () => {
  it('returns at most one page of products', () => {
    const result = runListingQuery(parse(''))
    expect(result.products.length).toBeLessThanOrEqual(PAGE_SIZE)
    expect(result.total).toBe(catalogProducts.length)
  })

  it('pages through the catalog without gaps or repeats', () => {
    const seen = []
    const pageCount = runListingQuery(parse('')).pageCount
    for (let page = 1; page <= pageCount; page += 1) {
      seen.push(...runListingQuery(parse(`page=${page}`)).products.map((p) => p.slug))
    }
    expect(seen).toHaveLength(catalogProducts.length)
    expect(new Set(seen).size).toBe(catalogProducts.length)
  })

  it('clamps an out-of-range page to the last real page and says so', () => {
    const result = runListingQuery(parse('page=999'))
    expect(result.page).toBe(result.pageCount)
    expect(result.pageWasClamped).toBe(true)
    expect(result.products.length).toBeGreaterThan(0)
  })

  it('does not report a clamp when the page is in range', () => {
    expect(runListingQuery(parse('page=1')).pageWasClamped).toBe(false)
  })

  it('reports one page and a zero count when nothing matches', () => {
    // A size no product lists, forced past validation to simulate a stale URL.
    const result = runListingQuery({
      ...parse(''),
      sizes: ['SIZE-THAT-DOES-NOT-EXIST'],
    })
    expect(result.total).toBe(0)
    expect(result.products).toEqual([])
    expect(result.pageCount).toBe(1)
    expect(result.firstIndex).toBe(0)
  })
})

describe('URL round-trip', () => {
  it('reproduces the same state from the params it builds', () => {
    const original = parse(
      'q=yoga&category=women-sports-equipments&price=1000-2500&sort=price-desc&page=2',
    )
    const reparsed = parseListingParams(buildListingParams(original))
    expect(reparsed).toEqual(original)
  })

  it('omits default values so a clean view has a clean URL', () => {
    expect(buildListingParams(parse('')).toString()).toBe('')
    expect(buildListingParams(parse('sort=featured&page=1')).toString()).toBe('')
  })

  it('produces a byte-identical string for the same state', () => {
    const a = buildListingParams(parse('category=women-sports-equipments&sort=price-asc'))
    const b = buildListingParams(parse('sort=price-asc&category=women-sports-equipments'))
    expect(a.toString()).toBe(b.toString())
  })

  it('resets to page 1 when a filter changes', () => {
    const state = parse('page=4&category=women-sports-equipments')
    const next = toggleListingValue(state, 'categories', 'women-sports-accessories')
    expect(next.get('page')).toBeNull()
  })

  it('resets to page 1 when the sort changes', () => {
    const next = withListingChange(parse('page=3'), { sort: 'price-asc' })
    expect(next.get('page')).toBeNull()
    expect(next.get('sort')).toBe('price-asc')
  })

  it('keeps the page when the page itself changes', () => {
    const next = withListingChange(parse('sort=price-asc'), { page: 3 })
    expect(next.get('page')).toBe('3')
    expect(next.get('sort')).toBe('price-asc')
  })

  it('clears every filter but keeps the sort', () => {
    const state = parse('q=yoga&category=women-sports-equipments&price=under-500&sort=name-asc')
    const next = parseListingParams(clearListingFilters(state))
    expect(next.query).toBe('')
    expect(next.categories).toEqual([])
    expect(next.prices).toEqual([])
    expect(next.sort).toBe('name-asc')
    expect(next.page).toBe(1)
  })

  it('does not write the category param on a scoped listing', () => {
    const state = parse('sort=price-asc', { scopeCategory: 'women-sports-equipments' })
    expect(buildListingParams(state).get('category')).toBeNull()
  })
})

describe('related products', () => {
  it('never includes the product itself and stays within its category', () => {
    for (const product of catalogProducts.slice(0, 10)) {
      const related = getRelatedProducts(product, { limit: 4 })
      expect(related.every((entry) => entry.id !== product.id)).toBe(true)
      expect(related.every((entry) => entry.categorySlug === product.categorySlug)).toBe(true)
      expect(related.length).toBeLessThanOrEqual(4)
    }
  })

  it('returns an empty list for a missing product rather than throwing', () => {
    expect(getRelatedProducts(undefined)).toEqual([])
  })
})
