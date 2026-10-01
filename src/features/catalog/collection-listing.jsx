import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListFilter, SlidersHorizontal, X } from 'lucide-react'

import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { EmptyState } from '@/components/shared/empty-state'
import { Pagination } from '@/components/shared/pagination'
import { ProductGrid } from '@/components/shared/product-grid'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { FilterRail } from '@/features/catalog/filter-rail'
import { useListing } from '@/features/catalog/use-listing'
import { SORT_OPTIONS } from '@/services/catalog-query'
import { cn } from '@/lib/utils'

/**
 * The shared collection listing: breadcrumbs, header, filter rail, sorting,
 * grid, pagination, and empty state.
 *
 * Used by both `/collections` (the whole catalog) and `/collections/:slug`
 * (one category). Everything that defines the view lives in the URL — see
 * `use-listing.js` for the contract.
 */
export function CollectionListing({
  breadcrumbs,
  title,
  description,
  banner,
  scopeCategory = null,
  resetTo = '/collections',
}) {
  const listing = useListing({ scopeCategory })
  const { state, result, facets, activeFilterCount, hasFilters, toggle, setSort, setPage } =
    listing

  const [sheetOpen, setSheetOpen] = useState(false)
  const resultsRef = useRef(null)
  const isFirstRender = useRef(true)

  /**
   * Move focus to the results heading when the page changes.
   *
   * Paginating replaces the whole grid; without this a keyboard or screen
   * reader user is left with focus on a button whose surroundings silently
   * changed. The heading is given `tabIndex={-1}` so it can receive focus
   * without becoming a tab stop. Deliberately not a scroll animation — the
   * brief rules out scroll hijacking.
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    resultsRef.current?.focus({ preventScroll: true })
  }, [result.page])

  const { total, page, pageCount, firstIndex, lastIndex } = result

  return (
    <div className="container-site py-8 sm:py-10">
      <Breadcrumbs items={breadcrumbs} className="mb-5" />

      <CollectionHeader title={title} description={description} banner={banner} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
        {/* Desktop filter rail. Hidden on small screens, where the Sheet takes over. */}
        <aside aria-labelledby="filters-heading" className="hidden lg:block">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
            <h2
              id="filters-heading"
              className="font-display text-base font-bold uppercase tracking-tight"
            >
              Filters
            </h2>
            {hasFilters && (
              <button
                type="button"
                onClick={listing.clearFilters}
                className="min-h-11 text-sm font-medium text-brand-600 hover:underline underline-offset-2"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterRail
            state={state}
            facets={facets}
            onToggle={toggle}
            idPrefix="desktop"
            className="pt-2"
          />
        </aside>

        <div className="min-w-0">
          {/* Result count + controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <h2
              ref={resultsRef}
              tabIndex={-1}
              className="text-sm font-medium text-ink-800 outline-none tabular-nums"
            >
              {total === 0 ? (
                'No products'
              ) : (
                <>
                  <span className="font-semibold">{total}</span>{' '}
                  {total === 1 ? 'product' : 'products'}
                  {pageCount > 1 && (
                    <span className="font-normal text-muted-foreground">
                      {' '}
                      · showing {firstIndex}–{lastIndex}
                    </span>
                  )}
                </>
              )}
            </h2>

            <div className="flex items-center gap-2">
              {/* Mobile filter Sheet */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="min-h-11 lg:hidden">
                    <SlidersHorizontal className="size-4" aria-hidden="true" focusable="false" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold tabular-nums text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="flex w-full flex-col sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle className="font-display uppercase tracking-tight">
                      Filters
                    </SheetTitle>
                    <SheetDescription>
                      {total === 0
                        ? 'No products match the current filters.'
                        : `${total} ${total === 1 ? 'product' : 'products'} match the current filters.`}
                    </SheetDescription>
                  </SheetHeader>

                  {/* Changes apply immediately to the URL; the count above and
                      the footer button reflect the live result, so "Apply" is
                      a confirmation and dismissal rather than a commit step. */}
                  <div className="min-h-0 flex-1 overflow-y-auto px-4">
                    <FilterRail
                      state={state}
                      facets={facets}
                      onToggle={toggle}
                      idPrefix="mobile"
                    />
                  </div>

                  <SheetFooter className="flex-row gap-2 border-t border-border">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={listing.clearFilters}
                      disabled={!hasFilters}
                    >
                      Reset
                    </Button>
                    <SheetClose asChild>
                      <Button className="flex-1">
                        Show {total} {total === 1 ? 'result' : 'results'}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <SortSelect value={state.sort} onChange={setSort} />
            </div>
          </div>

          {hasFilters && (
            <ActiveFilterChips listing={listing} className="mt-4" />
          )}

          {total === 0 ? (
            <EmptyState
              icon={ListFilter}
              className="mt-8"
              title="No products match these filters"
              description="Nothing in the catalog matches every filter you have applied. Clear them to see the full range."
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Button onClick={listing.clearFilters}>Clear all filters</Button>
                  <Button asChild variant="outline">
                    <Link to={resetTo}>Browse all products</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              <ProductGrid products={result.products} className="mt-6" columns={3} />
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
                className="mt-10"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Collection header: the title, the supporting copy, and category imagery.
 *
 * The banner is decorative — the real heading sits in HTML over it rather than
 * being baked into the artwork, per the project's banner convention.
 */
function CollectionHeader({ title, description, banner }) {
  if (!banner) {
    return (
      <header className="max-w-prose">
        <h1 className="font-display text-display-sm font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-3 text-muted-foreground text-pretty">{description}</p>}
      </header>
    )
  }

  /*
   * The banner art has promotional wording baked into it. Per the project's
   * banner convention the real heading lives in HTML on top, so the artwork is
   * anchored to its right side (where the photography sits) under a
   * left-to-right scrim that darkens the area the HTML heading occupies.
   *
   * The wording is baked across the whole width of the source art, so it
   * cannot be cropped out without ruining the photograph; the scrim reduces it
   * to an unreadable texture instead. Replacing these banners with clean,
   * text-free artwork is the real fix and is noted for a later phase.
   */
  return (
    <header className="relative isolate overflow-hidden rounded-card bg-ink-950">
      <img
        src={banner}
        alt=""
        aria-hidden="true"
        width="1600"
        height="500"
        className="absolute inset-0 size-full object-cover object-right"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink-950 from-45% via-ink-950/92 via-72% to-ink-950/40"
      />
      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <h1 className="max-w-lg font-display text-display-sm font-extrabold uppercase tracking-tight text-white text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base text-pretty">
            {description}
          </p>
        )}
      </div>
    </header>
  )
}

/**
 * Sort control.
 *
 * A native `<select>`: it is keyboard and screen-reader correct everywhere,
 * works on touch with the platform picker, and needs no focus management. The
 * label is visually hidden but present.
 */
function SortSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="collection-sort" className="sr-only">
        Sort products by
      </label>
      <select
        id="collection-sort"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-control border border-border bg-background px-3 pr-8 text-sm text-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Removable chips for each applied filter — the quickest path back out. */
function ActiveFilterChips({ listing, className }) {
  const { state, toggle, setQuery, clearFilters } = listing

  const chips = [
    ...(state.query ? [{ key: 'query', label: `“${state.query}”`, remove: () => setQuery('') }] : []),
    ...(state.scopeCategory
      ? []
      : state.categories.map((value) => ({
          key: `category-${value}`,
          label: value.replace('women-sports-', '').replace('women-', '').replace(/-/g, ' '),
          remove: () => toggle('categories', value),
        }))),
    ...state.brands.map((value) => ({
      key: `brand-${value}`,
      label: value,
      remove: () => toggle('brands', value),
    })),
    ...state.prices.map((value) => ({
      key: `price-${value}`,
      label: value.replace(/-/g, ' ').replace('above', 'above ₹').replace('under', 'under ₹'),
      remove: () => toggle('prices', value),
    })),
    ...state.sizes.map((value) => ({
      key: `size-${value}`,
      label: `Size ${value}`,
      remove: () => toggle('sizes', value),
    })),
    ...state.colors.map((value) => ({
      key: `color-${value}`,
      label: value,
      remove: () => toggle('colors', value),
    })),
  ]

  if (chips.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Applied
      </span>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              onClick={chip.remove}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-muted px-3 text-xs font-medium capitalize text-ink-800 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              {chip.label}
              <X className="size-3" aria-hidden="true" focusable="false" />
              <span className="sr-only">Remove filter</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={clearFilters}
        className="min-h-9 text-xs font-semibold text-brand-600 hover:underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  )
}
