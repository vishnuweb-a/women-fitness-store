import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { PhasePlaceholder } from '@/components/shared/page-shell'

/**
 * Landing page shell.
 *
 * The hero uses the local banner art with the headline and call to action as
 * real HTML on top, rather than relying on the text baked into the image:
 * the image carries `alt=""` because the heading beside it already conveys
 * the message, and the button is a real link.
 */
export function HomePage() {
  return (
    <div className="flex flex-col gap-section">
      <section className="relative isolate overflow-hidden bg-ink-950">
        <img
          src="/assets/banners/banner1.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <div className="container-site relative py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ink-200">
            Women who move
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-display-lg font-extrabold uppercase leading-[0.95] tracking-tight text-white">
            Stronger <span className="text-brand-500">every day</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-200">
            Accessories that support your goals. For every workout, every you.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/collections">Shop accessories</Link>
          </Button>
        </div>
      </section>

      <section className="container-site" aria-labelledby="home-next">
        <h2 id="home-next" className="text-xl font-semibold">
          Storefront sections
        </h2>
        <div className="mt-4">
          <PhasePlaceholder>
            Category tiles, featured products, best sellers, and reviews are
            built in the next phase.
          </PhasePlaceholder>
        </div>
      </section>
    </div>
  )
}
