import { Link } from 'react-router-dom'
import { CreditCard, PackageCheck, RotateCcw, ShieldCheck } from 'lucide-react'

import { NewsletterForm } from '@/components/shared/newsletter-form'
import { catalogCategories } from '@/services/catalog'

/**
 * Footer, following the reference layout: a newsletter strip, a trust row,
 * link columns, and the legal line.
 *
 * Every link points at a route that exists. The reference's "Best Sellers",
 * "New Arrivals", and "Sale" entries are omitted — no catalog field supports
 * those claims, and the links would lead to empty collections.
 */
const FOOTER_SECTIONS = [
  {
    heading: 'Shop',
    links: [
      { label: 'All products', to: '/collections' },
      ...catalogCategories.map((category) => ({
        label: category.label,
        to: `/collections/${category.slug}`,
      })),
    ],
  },
  {
    heading: 'Your account',
    links: [
      { label: 'Account', to: '/account' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Shopping bag', to: '/cart' },
    ],
  },
]

const TRUST_ITEMS = [
  { icon: PackageCheck, title: 'Free delivery', note: 'On orders over ₹999' },
  { icon: RotateCcw, title: '30-day returns', note: 'Hassle free' },
  { icon: ShieldCheck, title: 'Authentic products', note: 'Quality checked' },
  { icon: CreditCard, title: 'Secure checkout', note: 'Not yet operational' },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink-950 text-ink-200">
      {/* Newsletter */}
      <section
        aria-labelledby="newsletter-heading"
        className="border-b border-ink-800"
      >
        <div className="container-site flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <h2
              id="newsletter-heading"
              className="font-display text-2xl font-extrabold uppercase tracking-tight text-white"
            >
              Stay in the loop
            </h2>
            <p className="mt-2 text-sm text-ink-300 text-pretty">
              Fitness tips, new gear and exclusive offers.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* Trust row */}
      <section aria-label="Service highlights" className="border-b border-ink-800">
        <ul className="container-site grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <li key={item.title} className="flex items-center gap-3">
              <item.icon
                className="size-5 shrink-0 text-brand-500"
                aria-hidden="true"
                focusable="false"
              />
              <span>
                <span className="block text-sm font-semibold text-white">
                  {item.title}
                </span>
                <span className="block text-xs text-ink-400">{item.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="container-site grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-extrabold tracking-tight text-white">
            FITNE<span className="text-brand-500">X</span> WOMEN
          </p>
          <p className="mt-2 text-sm text-ink-400 text-pretty">
            Accessories that support your goals. For every workout, every you.
          </p>
          <p className="mt-4 text-sm font-semibold tracking-wide text-white">
            #StrongerEveryday
          </p>
        </div>

        {FOOTER_SECTIONS.map((section) => (
          <nav key={section.heading} aria-labelledby={`footer-${section.heading}`}>
            <h2
              id={`footer-${section.heading}`}
              className="text-sm font-semibold uppercase tracking-wide text-white"
            >
              {section.heading}
            </h2>
            <ul className="mt-3 space-y-1">
              {section.links.map((link) => (
                <li key={`${section.heading}-${link.label}`}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-9 items-center text-sm text-ink-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
            About
          </h2>
          <p className="mt-3 text-sm text-ink-400 text-pretty">
            FITNEX WOMEN is a demonstration storefront. Product data and imagery
            come from a public catalog scrape; checkout and payment are not
            operational.
          </p>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-4 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} FITNEX WOMEN. All rights reserved.</p>
          <p>Stronger People. A Healthier World.</p>
        </div>
      </div>
    </footer>
  )
}
