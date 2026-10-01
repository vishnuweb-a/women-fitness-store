/**
 * The listing URL contract, as a hook.
 *
 * Filters, sort, and pagination live entirely in the URL search params. There
 * is no mirrored component state, which is what makes the behaviour the brief
 * asks for fall out for free:
 *
 *   - Reloading or sharing the URL reproduces the view, because the URL *is*
 *     the view.
 *   - Back and forward restore the view, because each change is a history
 *     entry the router already manages.
 *   - Invalid params are normalised on read (`parseListingParams`), so a
 *     hand-edited URL cannot produce a broken listing.
 *   - A filter or sort change resets to page 1 (`withListingChange`).
 *
 * An out-of-range page is clamped by the query and then corrected in the URL
 * with a **replace**, not a push: the bad page was never a view the user
 * navigated to, so it must not become a history entry they can go "back" into.
 */
import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  buildListingParams,
  clearListingFilters,
  collectBrands,
  collectColors,
  collectSizes,
  countActiveFilters,
  filterProducts,
  hasActiveFilters,
  parseListingParams,
  PARAM,
  PRICE_BRACKETS,
  runListingQuery,
  toggleListingValue,
  withListingChange,
} from '@/services/catalog-query'
import { catalogCategories, catalogProducts } from '@/services/catalog'

/**
 * Count how many products a facet value would match **given the other filters**
 * but ignoring that facet's own selections.
 *
 * This is the behaviour people expect from a filter rail: the counts beside
 * "Size M" tell you how many of the currently-filtered products list size M,
 * and checking a second size widens rather than zeroes the list.
 */
function facetCounts(state, key, values, accessor, scopeProducts) {
  const withoutThisFacet = filterProducts({ ...state, [key]: [] }, scopeProducts)
  const counts = new Map(values.map((value) => [value, 0]))
  for (const product of withoutThisFacet) {
    for (const value of accessor(product)) {
      if (counts.has(value)) counts.set(value, counts.get(value) + 1)
    }
  }
  return counts
}

/**
 * Drive a product listing from the URL.
 *
 * `scopeCategory` pins the listing to a single category slug — the
 * `/collections/:slug` route — in which case the category filter is neither
 * read from nor written to the URL.
 */
export function useListing({ scopeCategory = null } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(
    () => parseListingParams(searchParams, { scopeCategory }),
    [searchParams, scopeCategory],
  )

  // The products this listing can ever show, before any filter is applied.
  const scopeProducts = useMemo(
    () =>
      scopeCategory
        ? catalogProducts.filter((product) => product.categorySlug === scopeCategory)
        : catalogProducts,
    [scopeCategory],
  )

  const result = useMemo(() => runListingQuery(state, scopeProducts), [state, scopeProducts])

  /**
   * Correct an out-of-range page in the URL.
   *
   * `replace` keeps the bad page out of the history stack. Running it in an
   * effect (rather than during render) keeps the render pure and lets the
   * clamped page render immediately.
   */
  useEffect(() => {
    if (!result.pageWasClamped) return
    setSearchParams(buildListingParams({ ...state, page: result.page }), { replace: true })
  }, [result.pageWasClamped, result.page, state, setSearchParams])

  const facets = useMemo(() => {
    const categoryCounts = facetCounts(
      state,
      'categories',
      catalogCategories.map((category) => category.slug),
      (product) => [product.categorySlug],
      scopeProducts,
    )

    const brandValues = collectBrands(scopeProducts)
    const brandCounts = facetCounts(
      state,
      'brands',
      brandValues,
      (product) => (product.brand ? [product.brand] : []),
      scopeProducts,
    )

    const sizeValues = collectSizes(scopeProducts)
    const sizeCounts = facetCounts(
      state,
      'sizes',
      sizeValues,
      (product) => product.sizes,
      scopeProducts,
    )

    const colorValues = collectColors(scopeProducts)
    const colorCounts = facetCounts(
      state,
      'colors',
      colorValues,
      (product) => product.colors,
      scopeProducts,
    )

    // Price counts need their own pass: the bracket is derived, not a field.
    const withoutPrice = filterProducts({ ...state, prices: [] }, scopeProducts)
    const priceCounts = {}
    for (const bracket of PRICE_BRACKETS) {
      priceCounts[bracket.value] = withoutPrice.filter((product) => {
        const paise = product.pricePaise
        if (typeof paise !== 'number' || paise < bracket.min) return false
        return bracket.max == null || paise <= bracket.max
      }).length
    }

    return {
      categories: catalogCategories.map((category) => ({
        ...category,
        count: categoryCounts.get(category.slug) ?? 0,
      })),
      brands: brandValues.map((value) => ({ value, count: brandCounts.get(value) ?? 0 })),
      sizes: sizeValues.map((value) => ({ value, count: sizeCounts.get(value) ?? 0 })),
      colors: colorValues.map((value) => ({ value, count: colorCounts.get(value) ?? 0 })),
      priceCounts,
    }
  }, [state, scopeProducts])

  const toggle = useCallback(
    (key, value) => setSearchParams(toggleListingValue(state, key, value)),
    [state, setSearchParams],
  )

  const setSort = useCallback(
    (sort) => setSearchParams(withListingChange(state, { sort })),
    [state, setSearchParams],
  )

  const setPage = useCallback(
    (page) => setSearchParams(withListingChange(state, { page })),
    [state, setSearchParams],
  )

  const setQuery = useCallback(
    (query) => setSearchParams(withListingChange(state, { query })),
    [state, setSearchParams],
  )

  const clearFilters = useCallback(
    () => setSearchParams(clearListingFilters(state)),
    [state, setSearchParams],
  )

  return {
    state,
    result,
    facets,
    scopeTotal: scopeProducts.length,
    activeFilterCount: countActiveFilters(state),
    hasFilters: hasActiveFilters(state),
    toggle,
    setSort,
    setPage,
    setQuery,
    clearFilters,
    PARAM,
  }
}
