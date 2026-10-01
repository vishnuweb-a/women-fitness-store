import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A promotional banner built on the original artwork.
 *
 * **Every banner in `banners/` has its headline and a button shape baked into
 * the pixels.** A picture of a button is not a button, and repeating the baked
 * headline in HTML would make screen readers announce it twice. So:
 *
 *   - the artwork is purely decorative (`alt=""`, `aria-hidden`), and
 *   - a single real link covers the tile, carrying the accessible name.
 *
 * Because the baked copy is already legible in the art, no HTML text is
 * layered on top of these tiles — the visible label would duplicate it. The
 * link's accessible name comes from visually hidden text instead.
 */
export function PromotionalBanner({
  src,
  to,
  label,
  className,
  aspect = 'aspect-[3/2]',
  priority = false,
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative block overflow-hidden rounded-card bg-ink-950',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        aspect,
        className,
      )}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="size-full object-cover transition-transform duration-500 ease-athletic group-hover:scale-[1.03]"
      />
      <span className="sr-only">{label}</span>

      {/* Visible affordance for mouse users, echoing the baked-in button
          without repeating its words to a screen reader. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-white/0 text-white opacity-0 transition-all duration-300 group-hover:bg-white/15 group-hover:opacity-100"
      >
        <ArrowRight className="size-5" focusable="false" />
      </span>
    </Link>
  )
}
