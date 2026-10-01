import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { ProductImage } from '@/components/shared/product-image'
import { formatPrice, searchProducts } from '@/services/catalog'
import { cn } from '@/lib/utils'

/**
 * Catalog search overlay.
 *
 * Follows the combobox keyboard contract: ArrowDown/ArrowUp move the active
 * option, Enter opens it, Escape closes the panel and returns focus to the
 * trigger. The active option is tracked with `aria-activedescendant` so focus
 * never leaves the text input while the list is being traversed.
 */
export function SearchPanel({ open, onOpenChange }) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false)
          }}
        >
          <SearchPanelBody onOpenChange={onOpenChange} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * The panel's interactive body.
 *
 * Split out so that it only exists while the panel is open: closing unmounts
 * it, which resets the query and the active option without an effect writing
 * state back on close.
 */
function SearchPanelBody({ onOpenChange }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const results = useMemo(
    () => (query.trim().length > 1 ? searchProducts(query, { limit: 8 }) : []),
    [query],
  )

  const trimmed = query.trim()
  const showNoResults = trimmed.length > 1 && results.length === 0

  // Focus the search input as soon as the panel mounts.
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 20)
    return () => window.clearTimeout(id)
  }, [])

  // Escape closes the panel from anywhere inside it.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onOpenChange])

  function goTo(product) {
    onOpenChange(false)
    navigate(`/products/${product.slug}`)
  }

  function handleKeyDown(event) {
    if (results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      goTo(results[activeIndex])
    }
  }

  return (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            className="mx-auto mt-0 w-full bg-background shadow-xl sm:mt-20 sm:max-w-2xl sm:rounded-card"
            initial={reduceMotion ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 border-b border-border p-3">
              <Search
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
                focusable="false"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for jackets, rackets, gloves…"
                aria-label="Search products"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
                }
                className="min-h-11 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close search"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink-600 hover:bg-muted"
              >
                <X className="size-5" aria-hidden="true" focusable="false" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {results.length > 0 && (
                <ul id={listId} role="listbox" aria-label="Search results" className="p-2">
                  {results.map((product, index) => (
                    <li
                      key={product.id}
                      id={`${listId}-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                    >
                      <button
                        type="button"
                        onClick={() => goTo(product)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-control p-2 text-left transition-colors',
                          index === activeIndex ? 'bg-muted' : 'hover:bg-muted',
                        )}
                      >
                        <span className="size-14 shrink-0 overflow-hidden rounded-control bg-muted">
                          <ProductImage
                            image={product.primaryImage}
                            sizes="56px"
                            className="size-full object-contain"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {product.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {product.categoryLabel}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatPrice(product.pricePaise, product.currency)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showNoResults && (
                <p role="status" className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No products match “{trimmed}”. Try a brand, a category, or a
                  product type such as “jacket” or “racquet”.
                </p>
              )}

              {trimmed.length <= 1 && (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Type at least two characters to search the catalog.
                </p>
              )}
            </div>
          </motion.div>
  )
}
