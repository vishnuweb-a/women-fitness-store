import { useId, useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'

import { PRICE_BRACKETS } from '@/services/catalog-query'
import { cn } from '@/lib/utils'

/**
 * One collapsible filter group.
 *
 * A real `<button>` with `aria-expanded`/`aria-controls` toggles a region that
 * is genuinely removed from the accessibility tree when closed (`hidden`),
 * rather than merely visually collapsed — a closed group must not be a tab
 * stop. Groups start open so the filters are discoverable without a click.
 */
function FilterGroup({ title, children, defaultOpen = true, count = 0 }) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = useId()

  return (
    <div className="border-b border-border py-4 first:pt-0 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-sm font-semibold text-ink-900"
        >
          <span>
            {title}
            {count > 0 && (
              <span className="ml-1.5 font-normal tabular-nums text-brand-600">({count})</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-ink-500 transition-transform duration-200',
              open && 'rotate-180',
            )}
            aria-hidden="true"
            focusable="false"
          />
        </button>
      </h3>
      <div id={contentId} hidden={!open} className="mt-2">
        {children}
      </div>
    </div>
  )
}

/**
 * A checkbox filter option.
 *
 * A native checkbox with a connected `<label>`: it is keyboard operable and
 * announces its checked state for free. The whole row is the label, so the
 * touch target spans the width rather than being the 16px box alone.
 */
function CheckboxOption({ name, value, label, hint, checked, onChange }) {
  const id = useId()
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="size-4 shrink-0 rounded-sm border-ink-400 text-brand-500 accent-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      />
      <label
        htmlFor={id}
        className="flex min-h-11 flex-1 cursor-pointer items-center gap-1.5 pl-2.5 text-sm text-ink-700"
      >
        <span className="text-pretty">{label}</span>
        {hint != null && (
          <span className="tabular-nums text-xs text-muted-foreground">({hint})</span>
        )}
      </label>
    </div>
  )
}

/**
 * The collection filter rail.
 *
 * Every filter here is backed by a field the catalog actually carries:
 * category, brand, price bracket, listed size, listed colour. There is no
 * availability, rating, discount, or "new in" filter, because the source has
 * no data behind any of them.
 *
 * The size and colour groups carry an explicit note that selecting an option
 * finds products that *list* it — the source does not say which size/colour
 * combinations exist, so the filter is not an availability claim.
 *
 * The component is presentational: the page owns the URL and passes `onToggle`.
 * The same instance renders in the desktop rail and inside the mobile Sheet.
 */
export function FilterRail({
  state,
  facets,
  onToggle,
  idPrefix = 'filter',
  className,
}) {
  return (
    <div className={cn('text-sm', className)}>
      {!state.scopeCategory && facets.categories.length > 1 && (
        <FilterGroup title="Category" count={state.categories.length}>
          <div className="flex flex-col">
            {facets.categories.map((category) => (
              <CheckboxOption
                key={category.slug}
                name={`${idPrefix}-category`}
                value={category.slug}
                label={category.longLabel}
                hint={category.count}
                checked={state.categories.includes(category.slug)}
                onChange={(value) => onToggle('categories', value)}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {facets.brands.length > 1 && (
        <FilterGroup title="Brand" count={state.brands.length}>
          <div className="flex max-h-72 flex-col overflow-y-auto pr-1">
            {facets.brands.map((brand) => (
              <CheckboxOption
                key={brand.value}
                name={`${idPrefix}-brand`}
                value={brand.value}
                label={brand.value}
                hint={brand.count}
                checked={state.brands.includes(brand.value)}
                onChange={(value) => onToggle('brands', value)}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Price" count={state.prices.length}>
        <div className="flex flex-col">
          {PRICE_BRACKETS.map((bracket) => (
            <CheckboxOption
              key={bracket.value}
              name={`${idPrefix}-price`}
              value={bracket.value}
              label={bracket.label}
              hint={facets.priceCounts[bracket.value] ?? 0}
              checked={state.prices.includes(bracket.value)}
              onChange={(value) => onToggle('prices', value)}
            />
          ))}
        </div>
      </FilterGroup>

      {facets.sizes.length > 0 && (
        <FilterGroup title="Listed sizes" count={state.sizes.length}>
          <div className="flex flex-col">
            {facets.sizes.map((size) => (
              <CheckboxOption
                key={size.value}
                name={`${idPrefix}-size`}
                value={size.value}
                label={size.value}
                hint={size.count}
                checked={state.sizes.includes(size.value)}
                onChange={(value) => onToggle('sizes', value)}
              />
            ))}
          </div>
          <OptionCaveat>
            Finds products that <strong className="font-semibold">list</strong> this
            size. Availability of a specific size is not confirmed.
          </OptionCaveat>
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Listed colours" count={state.colors.length}>
          <div className="flex max-h-64 flex-col overflow-y-auto pr-1">
            {facets.colors.map((color) => (
              <CheckboxOption
                key={color.value}
                name={`${idPrefix}-color`}
                value={color.value}
                label={color.value}
                hint={color.count}
                checked={state.colors.includes(color.value)}
                onChange={(value) => onToggle('colors', value)}
              />
            ))}
          </div>
          <OptionCaveat>
            Finds products that <strong className="font-semibold">list</strong> this
            colour. Availability of a specific colour is not confirmed.
          </OptionCaveat>
        </FilterGroup>
      )}
    </div>
  )
}

/** The shared "this is not a stock claim" note under an option filter. */
function OptionCaveat({ children }) {
  return (
    <p className="mt-2 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" focusable="false" />
      <span className="text-pretty">{children}</span>
    </p>
  )
}
