import { Link } from 'react-router-dom'

const FOOTER_SECTIONS = [
  {
    heading: 'Shop',
    links: [
      { label: 'All products', to: '/collections' },
      { label: 'New arrivals', to: '/collections/new-arrivals' },
      { label: 'Best sellers', to: '/collections/best-sellers' },
      { label: 'Sale', to: '/collections/sale' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Track order', to: '/account' },
      { label: 'Returns & exchanges', to: '/account' },
      { label: 'Size guide', to: '/collections' },
      { label: 'Help centre', to: '/account' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'Our story', to: '/' },
      { label: 'Sustainability', to: '/' },
      { label: 'Careers', to: '/' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-ink-950 text-ink-200">
      <div className="container-site grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-extrabold tracking-tight text-white">
            FITNEX<span className="text-brand-500">.</span> WOMEN
          </p>
          <p className="mt-2 text-sm text-ink-400">
            Accessories that support your goals. For every workout, every you.
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
            <ul className="mt-3 space-y-2">
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
