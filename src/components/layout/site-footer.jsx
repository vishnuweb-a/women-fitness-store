import { Link } from 'react-router-dom'
import { CreditCard, LifeBuoy, PackageCheck, RotateCcw } from 'lucide-react'

import { NewsletterForm } from '@/components/shared/newsletter-form'
import {
  COMPANY_EMAIL_HREF,
  COMPANY_INFO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_HREF,
} from '@/lib/company-info'
import { CATEGORY_NAV } from '@/services/category-meta'

/**
 * Footer, following the reference layout: a newsletter strip, a trust row,
 * link columns, the operating company's details, and the legal line.
 *
 * The company details come from `lib/company-info.js`, the same source the
 * contact and policy pages read, so they cannot drift apart.
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
      ...CATEGORY_NAV.map((category) => ({
        label: category.label,
        to: `/collections/${category.slug}`,
      })),
    ],
  },
  {
    heading: 'Customer',
    links: [
      { label: 'Customer hub', to: '/account' },
      { label: 'Profile preview', to: '/account/profile' },
      { label: 'Address preview', to: '/account/addresses' },
      { label: 'Demo orders', to: '/account/orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Shopping bag', to: '/cart' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Help centre', to: '/help' },
      { label: 'Contact us', to: '/contact' },
      { label: 'About us', to: '/about' },
      { label: 'Shipping', to: '/shipping' },
      { label: 'Returns & refunds', to: '/returns' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Disclaimer', to: '/disclaimer' },
    ],
  },
]

/**
 * The service row.
 *
 * It previously advertised "Free delivery on orders over ₹999" and "30-day
 * returns". No such policy has been set — the shipping and returns pages say
 * so explicitly — so the footer must not assert them on every page of the
 * site. Each row now points at the page that states the real status.
 */
const TRUST_ITEMS = [
  {
    icon: PackageCheck,
    title: 'Shipping',
    note: 'Policy not set yet',
    to: '/shipping',
  },
  { icon: RotateCcw, title: 'Returns', note: 'Policy not set yet', to: '/returns' },
  { icon: LifeBuoy, title: 'Help centre', note: 'What this build does', to: '/help' },
  {
    icon: CreditCard,
    title: 'Demo checkout',
    note: 'No payment is taken',
    to: '/help',
  },
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
            <li key={item.title}>
              <Link
                to={item.to}
                className="flex min-h-11 items-center gap-3 rounded-control transition-colors hover:text-white"
              >
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
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="container-site grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
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
            come from a public catalog scrape. Checkout is a frontend
            demonstration: no payment is taken and no order is placed.
          </p>
        </div>
      </div>

      {/* Company information */}
      <section aria-labelledby="footer-company" className="border-t border-ink-800">
        <div className="container-site py-8">
          <h2
            id="footer-company"
            className="text-sm font-semibold uppercase tracking-wide text-white"
          >
            Company information
          </h2>
          <address className="mt-4 grid gap-5 text-sm not-italic text-ink-300 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Operated by
              </p>
              <p className="mt-1 font-semibold text-white">{COMPANY_INFO.legalName}</p>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Registered address
              </p>
              <p className="mt-1 break-words text-pretty">{COMPANY_INFO.address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Get in touch
              </p>
              <ul className="mt-1">
                <li>
                  <span className="text-ink-400">Phone: </span>
                  <a
                    href={COMPANY_PHONE_HREF}
                    aria-label={`${COMPANY_PHONE_DISPLAY}, call ${COMPANY_INFO.legalName}`}
                    className="inline-flex min-h-9 items-center text-ink-200 underline-offset-2 transition-colors hover:text-white hover:underline"
                  >
                    {COMPANY_PHONE_DISPLAY}
                  </a>
                </li>
                <li>
                  <span className="text-ink-400">Email: </span>
                  <a
                    href={COMPANY_EMAIL_HREF}
                    aria-label={`${COMPANY_INFO.email}, email ${COMPANY_INFO.legalName}`}
                    className="inline-flex min-h-9 items-center break-all text-ink-200 underline-offset-2 transition-colors hover:text-white hover:underline"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </li>
              </ul>
            </div>
          </address>
        </div>
      </section>

      <div className="border-t border-ink-800">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-4 text-center text-xs text-ink-400 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {COMPANY_INFO.legalName}. All rights reserved.
          </p>
          <p>Stronger People. A Healthier World.</p>
        </div>
      </div>
    </footer>
  )
}
