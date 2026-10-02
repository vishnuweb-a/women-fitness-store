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
 * ## What this deliberately omits
 *
 * No canonical URL, no `og:url`, and no `og:image`: this build has no
 * production domain and no social-preview asset, and inventing either would
 * put a wrong URL into every share card.
 */
export function PageMeta({ title, description = DEFAULT_DESCRIPTION, noIndex = false }) {
  const fullTitle = buildPageTitle(title)

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
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
