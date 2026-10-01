import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { Button } from '@/components/ui/button'

/**
 * Homepage hero.
 *
 * `banner1.png` carries "STRONGER EVERY DAY" and a button shape in the pixels.
 * Rather than overlay HTML on top of that baked copy — which would show the
 * words twice — the artwork is cropped to its photographic right-hand side on
 * desktop and the headline is rendered as real HTML beside it. The image is
 * decorative (`alt=""`, `aria-hidden`); the `h1` and the link carry all of the
 * meaning.
 *
 * The entrance animation moves opacity and transform only, and is skipped
 * entirely under `prefers-reduced-motion` — the content is in its final
 * position from the first paint either way.
 */
export function HeroBanner() {
  const reduceMotion = useReducedMotion()

  const rise = (delay) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
        }

  return (
    <section className="relative isolate overflow-hidden bg-ink-950">
      <img
        src="/assets/banners/banner1.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-[72%_center] opacity-55 lg:opacity-70"
      />
      {/* Readability scrim: the headline sits over photography. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30"
      />

      <div className="container-site relative py-16 sm:py-20 lg:py-28">
        <motion.p
          {...rise(0)}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-300 sm:text-sm"
        >
          Women who move
        </motion.p>

        <motion.h1
          {...rise(0.08)}
          className="mt-3 max-w-2xl font-display text-display-lg font-extrabold uppercase leading-[0.92] tracking-tight text-white text-balance"
        >
          Stronger <span className="text-brand-500">every day</span>
        </motion.h1>

        <motion.p
          {...rise(0.16)}
          className="mt-4 max-w-md text-base text-ink-200 text-pretty sm:text-lg"
        >
          Sportswear, equipment and accessories that support your goals. For
          every workout, every you.
        </motion.p>

        <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/collections">
              Shop all products
              <ArrowRight className="size-4" aria-hidden="true" focusable="false" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/collections/women-sportswear-clothing">Shop sportswear</Link>
          </Button>
        </motion.div>

        <motion.ul
          {...rise(0.32)}
          className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-wide text-ink-300 sm:text-sm"
        >
          {['Move stronger', 'Feel better', 'Look confident', 'Be unstoppable'].map(
            (item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-brand-500"
                />
                {item}
              </li>
            ),
          )}
        </motion.ul>
      </div>
    </section>
  )
}
