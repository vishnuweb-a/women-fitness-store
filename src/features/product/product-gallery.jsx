import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'

import { ProductImage } from '@/components/shared/product-image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/**
 * Product gallery: a thumbnail rail, a primary image, and an accessible
 * enlargement Dialog.
 *
 * Accessibility decisions:
 *   - The thumbnail rail is a `tablist`/`tab` pattern: one tab stop for the
 *     whole rail, arrow keys move between thumbnails, and the selected
 *     thumbnail carries `aria-selected`. Tabbing through eight thumbnails to
 *     reach the Add-to-bag button would be hostile.
 *   - The Dialog is Radix's, so focus is trapped while open, Escape closes it,
 *     and focus returns to the trigger on close — no manual restoration needed.
 *   - Previous/Next are real buttons with labels, not bare chevrons.
 *
 * Single-image products get no rail and no arrows: there is nothing to move
 * between, so the controls would be dead weight. The enlargement still works.
 *
 * The selected index is not reset when `product` changes: the route keys the
 * whole product page on the slug, so a different product mounts a fresh
 * gallery rather than reusing this one's state.
 */
export function ProductGallery({ product }) {
  const [active, setActive] = useState(0)
  const tabRefs = useRef([])

  const images = product.images
  const current = images[active] ?? product.primaryImage
  const multiple = images.length > 1

  function move(delta) {
    const next = (active + delta + images.length) % images.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  /** Roving-tabindex keyboard contract for the thumbnail rail. */
  function handleTabKeyDown(event) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        move(1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        move(-1)
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        tabRefs.current[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        setActive(images.length - 1)
        tabRefs.current[images.length - 1]?.focus()
        break
      default:
    }
  }

  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-start">
      {multiple && (
        <div
          role="tablist"
          aria-label={`${product.name} images`}
          aria-orientation="vertical"
          /*
           * The rail scrolls inside a fixed height on wide screens so a
           * 14-thumbnail gallery never runs past the bottom of the square image
           * panel beside it. The cap is expressed in the same units as the
           * thumbnails (5 x 5rem plus gaps) rather than tied to the panel,
           * which keeps the two independent of each other's layout. On narrow
           * screens it is a horizontal strip above the image instead —
           * `min-w-0` there lets `overflow-x-auto` actually scroll, rather
           * than the strip widening the flex row and with it the whole page.
           */
          className="flex min-w-0 shrink-0 gap-2 overflow-x-auto pb-1 sm:max-h-[27rem] sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0 sm:pr-1"
        >
          {images.map((image, index) => (
            <button
              key={image.localSrc}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`gallery-tab-${index}`}
              aria-selected={index === active}
              aria-controls="gallery-panel"
              aria-label={image.alt}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={handleTabKeyDown}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-control border-2 bg-muted transition-colors sm:size-20',
                index === active
                  ? 'border-brand-500'
                  : 'border-border hover:border-ink-400',
              )}
            >
              <ProductImage
                image={{ ...image, alt: '' }}
                sizes="80px"
                className="size-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      <div
        id="gallery-panel"
        role={multiple ? 'tabpanel' : undefined}
        aria-labelledby={multiple ? `gallery-tab-${active}` : undefined}
        className="relative min-w-0 flex-1 overflow-hidden rounded-card border border-border bg-muted"
      >
        {/* Square on desktop: the catalog mixes apparel (tall) with equipment
            (wide), and `object-contain` inside a square frame fits both
            without leaving a band of dead space under the shorter ones. */}
        <div className="aspect-[3/4] sm:aspect-square">
          <ProductImage
            image={current}
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
            className="size-full object-contain"
          />
        </div>

        {multiple && (
          <>
            <GalleryArrow side="left" onClick={() => move(-1)} label="Previous image" />
            <GalleryArrow side="right" onClick={() => move(1)} label="Next image" />
          </>
        )}

        {/* Enlargement. Radix handles the focus trap and focus restoration. */}
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="absolute bottom-3 right-3 inline-flex size-11 items-center justify-center rounded-full bg-background/90 text-ink-800 shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <Expand className="size-4" aria-hidden="true" focusable="false" />
              <span className="sr-only">Enlarge image: {current?.alt}</span>
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl p-4 sm:p-6">
            <DialogTitle className="font-display text-base font-bold uppercase tracking-tight">
              {product.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {multiple
                ? `Image ${active + 1} of ${images.length}. Use the thumbnails behind this dialog to change image.`
                : 'The only image supplied for this product.'}
            </DialogDescription>
            <div className="mt-2 overflow-hidden rounded-card bg-muted">
              <div className="aspect-square">
                <ProductImage
                  image={current}
                  priority
                  sizes="(min-width: 768px) 720px, 100vw"
                  className="size-full object-contain"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function GalleryArrow({ side, onClick, label }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-ink-800 shadow-sm backdrop-blur transition-colors hover:bg-background',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <Icon className="size-5" aria-hidden="true" focusable="false" />
      <span className="sr-only">{label}</span>
    </button>
  )
}
