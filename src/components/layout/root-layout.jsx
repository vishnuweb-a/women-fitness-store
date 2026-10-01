import { Outlet, ScrollRestoration } from 'react-router-dom'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

/**
 * Shared chrome for every route: header, a labelled main region, and footer.
 *
 * The skip link is the first focusable element so keyboard users can jump
 * past the navigation. `main` carries `tabIndex={-1}` so it can receive
 * programmatic focus as the skip-link target.
 */
export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link rounded-control bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
      <ScrollRestoration />
    </div>
  )
}
