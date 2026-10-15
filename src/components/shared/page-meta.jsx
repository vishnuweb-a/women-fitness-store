import { useLocation } from 'react-router-dom'

import { SITE_ORIGIN } from '@/lib/company-info'
import { buildPageTitle, DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/page-title'

/**
 * Per-route document metadata.
 *
 * React 19 hoists `<title>`, `<meta>`, and `<link>` rendered anywhere in the
 * tree into `<head>`, so a route can declare its own metadata without a helper
 * library and without an effect that races route transitions. Rendering this
 * replaces the static tags in `index.html`.
 *
 * Every route needs its own title: without one a browser tab, a history entry,
 * and a bookmark are identical on all twenty routes, and a screen reader
 * announces the same page name after every navigation.
 *
 * ## `noIndex`
 *
 * The demo checkout and the customer pages render session-only, fabricated
 * state. They are not real storefront pages and must not appear in search
 * results, so they opt out of indexing. See `docs/FRONTEND_FINAL_QA.md` for
 * what has to change before a real launch.
 *
 * ## Canonical URL
 *
 * Indexable routes declare a canonical URL and a matching `og:url` on the
 * production origin (`SITE_ORIGIN`, supplied by the owner). It is the path
 * alone: filter, sort, and page parameters are views of one listing, not
 * separate pages, so they all point at the unfiltered URL. A `noIndex` route
 * declares none — a page asking not to be indexed has no canonical to offer.
 *
 * ## What this deliberately omits
 *
 * No `og:image`: no social-preview asset exists, and pointing every share
 * card at an arbitrary banner would misrepresent most pages.
 */
export function PageMeta({ title, description = DEFAULT_DESCRIPTION, noIndex = false }) {
  const { pathname } = useLocation()
  const fullTitle = buildPageTitle(title)
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const canonical = noIndex ? null : `${SITE_ORIGIN}${path}`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </>
  )
}
