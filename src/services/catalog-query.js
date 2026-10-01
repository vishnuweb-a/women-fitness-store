/**
 * Collection querying: filtering, sorting, and pagination over the normalised
 * catalog, plus the URL-search-param contract that makes a listing shareable.
 *
 * This module is deliberately **pure and data-only** so the whole listing
 * contract can be tested without rendering anything. The page component owns
 * the URL; this module owns the meaning of what is in it.
 *
 * Design constraints carried over from the catalog layer:
 *
 *   - **Filters may only use fields the source actually carries.** Category,
 *     brand, price, listed sizes, and listed colours all exist on every
 *     normalised product. There is no stock, rating-threshold, rank, arrival
 *     date, or discount filter, because the source supports none of them.
 *   - **Size and colour are independent option lists.** Filtering by them
 *     selects products that *list* the option. It is not an availability
 *     claim, and the UI labels them accordingly.
 *   - **Sorting is total.** Every comparator falls back to the slug, so equal
 *     keys never leave the order up to the engine's sort stability.
 *   - **Every parameter is normalised.** Unknown values are dropped rather
 *     than trusted, so a hand-edited URL cannot produce a broken view.
 */
import { CATEGORY_META, catalogProducts } from '@/services/catalog'

/** Products shown per page. Matches the reference's 3x4 desktop listing. */
export const PAGE_SIZE = 12

/**
 * Supported sorts.
 *
 * Only price and name are offered: the source has no sales rank, no arrival
 * date, and no discount, so "Best selling", "Newest", and "Biggest saving"
 * would all be fabrications. `relevance` is catalog order — the stable default.
 */
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
]

const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value))
export const DEFAULT_SORT = 'featured'

/**
 * Price brackets, in integer paise.
 *
 * `max: null` means "and above". These are presentation buckets over the real
 * price range (₹199–₹12,499); they invent nothing.
 */
export const PRICE_BRACKETS = [
  { value: 'under-500', label: 'Under ₹500', min: 0, max: 49999 },
  { value: '500-1000', label: '₹500 – ₹1,000', min: 50000, max: 100000 },
  { value: '1000-2500', label: '₹1,000 – ₹2,500', min: 100000, max: 250000 },
  { value: '2500-5000', label: '₹2,500 – ₹5,000', min: 250000, max: 500000 },
  { value: 'above-5000', label: 'Above ₹5,000', min: 500000, max: null },
]

const PRICE_BRACKETS_BY_VALUE = new Map(PRICE_BRACKETS.map((b) => [b.value, b]))

/** Search-param keys. Kept in one place so the page and the tests agree. */
export const PARAM = {
  query: 'q',
  category: 'category',
  brand: 'brand',
  price: 'price',
  size: 'size',
  color: 'color',
  sort: 'sort',
  page: 'page',
}

/** Catalog order, captured once so `featured` is stable across sorts. */
const CATALOG_ORDER = new Map(catalogProducts.map((product, index) => [product.slug, index]))

/**
 * Read a repeatable parameter as a de-duplicated list.
 *
 * Accepts both `?size=S&size=M` and `?size=S,M` so a hand-written or
 * hand-edited URL behaves the way someone would expect.
 */
function readList(params, key) {
  const raw = params.getAll(key)
  const out = []
  const seen = new Set()
  for (const entry of raw) {
    for (const piece of String(entry).split(',')) {
      const value = piece.trim()
      if (value && !seen.has(value)) {
        seen.add(value)
        out.push(value)
      }
    }
  }
  return out
}

/** Keep only values that exist in `allowed`, preserving the caller's order. */
function keepKnown(values, allowed) {
  const set = allowed instanceof Set ? allowed : new Set(allowed)
  return values.filter((value) => set.has(value))
}

/**
 * Case-insensitive matching against a product's option list.
 * Returns the canonical catalog casing so the URL and the UI agree.
 */
function canonicalise(values, allowed) {
  const lookup = new Map([...allowed].map((value) => [value.toLowerCase(), value]))
  const out = []
  const seen = new Set()
  for (const value of values) {
    const match = lookup.get(String(value).toLowerCase())
    if (match && !seen.has(match)) {
      seen.add(match)
      out.push(match)
    }
  }
  return out
}

/** Every brand present in a product set, sorted for a stable filter rail. */
export function collectBrands(products) {
  const brands = new Set()
  for (const product of products) {
    if (product.brand) brands.add(product.brand)
  }
  return [...brands].sort((a, b) => a.localeCompare(b))
}

/** Every listed size across a product set. Sizes are sorted by convention. */
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

function sizeRank(value) {
  const index = SIZE_ORDER.indexOf(String(value).toUpperCase())
  return index === -1 ? SIZE_ORDER.length : index
}

export function collectSizes(products) {
  const sizes = new Set()
  for (const product of products) {
    for (const size of product.sizes) sizes.add(size)
  }
  return [...sizes].sort((a, b) => {
    const rank = sizeRank(a) - sizeRank(b)
    return rank !== 0 ? rank : a.localeCompare(b, undefined, { numeric: true })
  })
}

/** Every listed colour across a product set. */
export function collectColors(products) {
  const colors = new Set()
  for (const product of products) {
    for (const color of product.colors) colors.add(color)
  }
  return [...colors].sort((a, b) => a.localeCompare(b))
}

/**
 * Normalise raw search params into a filter state.
 *
 * Anything unrecognised is dropped: an unknown category, a brand nobody
 * stocks, a price bracket that does not exist, a negative page, a sort key
 * that was never offered. The result is always safe to apply.
 *
 * `scopeCategory` pins the listing to one category (the `/collections/:slug`
 * route); the category filter is then not read from the URL at all.
 */
export function parseListingParams(params, { scopeCategory = null } = {}) {
  const searchParams =
    params instanceof URLSearchParams ? params : new URLSearchParams(params ?? '')

  const categorySlugs = new Set(Object.keys(CATEGORY_META))

  const categories = scopeCategory
    ? []
    : keepKnown(readList(searchParams, PARAM.category), categorySlugs)

  // Brands/sizes/colours are validated against the catalog, not against the
  // category subset: a filter the current scope cannot satisfy is still a
  // real filter, and must produce an honest empty state rather than vanish.
  const brands = canonicalise(
    readList(searchParams, PARAM.brand),
    collectBrands(catalogProducts),
  )
  const sizes = canonicalise(readList(searchParams, PARAM.size), collectSizes(catalogProducts))
  const colors = canonicalise(
    readList(searchParams, PARAM.color),
    collectColors(catalogProducts),
  )
  const prices = keepKnown(readList(searchParams, PARAM.price), PRICE_BRACKETS_BY_VALUE.keys())

  const rawSort = searchParams.get(PARAM.sort)
  const sort = rawSort && SORT_VALUES.has(rawSort) ? rawSort : DEFAULT_SORT

  const rawQuery = searchParams.get(PARAM.query)
  const query = typeof rawQuery === 'string' ? rawQuery.trim().slice(0, 100) : ''

  // A non-numeric, zero, negative, or fractional page falls back to page 1.
  // The upper bound depends on the result count, so it is clamped later.
  const rawPage = Number.parseInt(searchParams.get(PARAM.page) ?? '', 10)
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1

  return {
    query,
    categories: scopeCategory ? [scopeCategory] : categories,
    scopeCategory,
    brands,
    prices,
    sizes,
    colors,
    sort,
    page,
  }
}

/** True when any filter (not sort or page) is applied. */
export function hasActiveFilters(state) {
  return Boolean(
    state.query ||
      (!state.scopeCategory && state.categories.length > 0) ||
      state.brands.length > 0 ||
      state.prices.length > 0 ||
      state.sizes.length > 0 ||
      state.colors.length > 0,
  )
}

/** How many individual filter values are applied — for the mobile badge. */
export function countActiveFilters(state) {
  return (
    (state.query ? 1 : 0) +
    (state.scopeCategory ? 0 : state.categories.length) +
    state.brands.length +
    state.prices.length +
    state.sizes.length +
    state.colors.length
  )
}

/** Does a product's price fall in any of the selected brackets? */
function matchesPrice(product, bracketValues) {
  if (bracketValues.length === 0) return true
  const paise = product.pricePaise
  if (typeof paise !== 'number') return false
  return bracketValues.some((value) => {
    const bracket = PRICE_BRACKETS_BY_VALUE.get(value)
    if (!bracket) return false
    if (paise < bracket.min) return false
    return bracket.max == null || paise <= bracket.max
  })
}

/** Free-text match over the fields the catalog search already uses. */
function matchesQuery(product, query) {
  if (!query) return true
  const haystack = [
    product.name,
    product.brand,
    product.categoryLabel,
    product.productType,
    product.sport,
    product.material,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

/** Apply every filter in the state. Order does not matter; all must pass. */
export function filterProducts(state, products = catalogProducts) {
  return products.filter((product) => {
    if (state.categories.length > 0 && !state.categories.includes(product.categorySlug)) {
      return false
    }
    if (state.brands.length > 0 && !state.brands.includes(product.brand)) return false
    if (!matchesPrice(product, state.prices)) return false
    if (state.sizes.length > 0 && !state.sizes.some((size) => product.sizes.includes(size))) {
      return false
    }
    if (
      state.colors.length > 0 &&
      !state.colors.some((color) => product.colors.includes(color))
    ) {
      return false
    }
    if (!matchesQuery(product, state.query)) return false
    return true
  })
}

/**
 * Sort a product list.
 *
 * Every comparator ends in a slug tiebreak, so the order is total and a reload
 * produces exactly the same sequence. Products without a price sort last on a
 * price sort rather than being treated as free.
 */
export function sortProducts(products, sort = DEFAULT_SORT) {
  const list = [...products]
  const bySlug = (a, b) => a.slug.localeCompare(b.slug)

  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => {
        const left = a.pricePaise ?? Number.POSITIVE_INFINITY
        const right = b.pricePaise ?? Number.POSITIVE_INFINITY
        return left - right || bySlug(a, b)
      })
    case 'price-desc':
      return list.sort((a, b) => {
        const left = a.pricePaise ?? Number.NEGATIVE_INFINITY
        const right = b.pricePaise ?? Number.NEGATIVE_INFINITY
        return right - left || bySlug(a, b)
      })
    case 'name-asc':
      return list.sort((a, b) => a.name.localeCompare(b.name) || bySlug(a, b))
    case 'name-desc':
      return list.sort((a, b) => b.name.localeCompare(a.name) || bySlug(a, b))
    case 'featured':
    default:
      // Catalog order — the order the data was supplied in. Not a sales rank.
      return list.sort(
        (a, b) =>
          (CATALOG_ORDER.get(a.slug) ?? 0) - (CATALOG_ORDER.get(b.slug) ?? 0) ||
          bySlug(a, b),
      )
  }
}

/**
 * Run a full listing query: filter, sort, then page.
 *
 * The page number is clamped to the available range, so an out-of-range page
 * (a stale bookmark, a hand-edited URL, or a filter change that shrank the
 * result set) renders the last real page instead of an empty grid. The caller
 * gets `pageWasClamped` so it can correct the URL.
 */
export function runListingQuery(state, products = catalogProducts) {
  const filtered = filterProducts(state, products)
  const sorted = sortProducts(filtered, state.sort)

  const total = sorted.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(Math.max(state.page, 1), pageCount)
  const start = (page - 1) * PAGE_SIZE

  return {
    products: sorted.slice(start, start + PAGE_SIZE),
    total,
    page,
    pageCount,
    pageWasClamped: page !== state.page,
    firstIndex: total === 0 ? 0 : start + 1,
    lastIndex: Math.min(start + PAGE_SIZE, total),
  }
}

/**
 * Build the search params for a listing state.
 *
 * Default values are omitted so a clean view has a clean URL, and the keys are
 * written in a fixed order so the same state always produces the same string —
 * which keeps browser history entries from differing only by key order.
 */
export function buildListingParams(state) {
  const params = new URLSearchParams()
  if (state.query) params.set(PARAM.query, state.query)
  if (!state.scopeCategory) {
    for (const value of state.categories) params.append(PARAM.category, value)
  }
  for (const value of state.brands) params.append(PARAM.brand, value)
  for (const value of state.prices) params.append(PARAM.price, value)
  for (const value of state.sizes) params.append(PARAM.size, value)
  for (const value of state.colors) params.append(PARAM.color, value)
  if (state.sort && state.sort !== DEFAULT_SORT) params.set(PARAM.sort, state.sort)
  if (state.page > 1) params.set(PARAM.page, String(state.page))
  return params
}

/**
 * Produce the next params after a filter change.
 *
 * **Pagination always resets to page 1 on a filter or sort change** — staying
 * on page 4 of a result set that just shrank to one page is the classic
 * listing bug. Only an explicit page change keeps the page.
 */
export function withListingChange(state, change) {
  const next = {
    ...state,
    ...change,
    page: 'page' in change ? change.page : 1,
  }
  return buildListingParams(next)
}

/** Toggle one value in a multi-select filter and return the next params. */
export function toggleListingValue(state, key, value) {
  const current = state[key] ?? []
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value]
  return withListingChange(state, { [key]: next })
}

/** Clear every filter, keeping the sort. Pagination resets. */
export function clearListingFilters(state) {
  return withListingChange(state, {
    query: '',
    categories: [],
    brands: [],
    prices: [],
    sizes: [],
    colors: [],
  })
}

/**
 * Related products for a product page.
 *
 * Same category first, then the rest of the catalog, excluding the product
 * itself. Deterministic, and makes no claim about why these are related beyond
 * sharing a category — which is all the source supports.
 */
export function getRelatedProducts(product, { limit = 5 } = {}) {
  if (!product) return []
  const sameCategory = catalogProducts.filter(
    (entry) => entry.categorySlug === product.categorySlug && entry.id !== product.id,
  )
  const sameBrand = sameCategory.filter((entry) => entry.brand === product.brand)
  const others = sameCategory.filter((entry) => entry.brand !== product.brand)

  return [...sameBrand, ...others].slice(0, limit)
}
