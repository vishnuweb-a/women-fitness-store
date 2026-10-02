/**
 * Document-title composition.
 *
 * Kept out of `page-meta.jsx` because that module exports a component: a file
 * that exports both a component and a plain function breaks Fast Refresh, and
 * ESLint's `react-refresh/only-export-components` rule flags it.
 */

export const SITE_NAME = 'FITNEX WOMEN'

export const DEFAULT_DESCRIPTION =
  'FITNEX WOMEN - sports and fitness accessories designed for women who move stronger every day.'

/**
 * Compose the document title for a route.
 *
 * A route that supplies no title gets the site's own title rather than a bare
 * separator; a route that supplies one is always suffixed with the site name,
 * so a tab, a history entry, and a bookmark each identify the site as well as
 * the page.
 */
export function buildPageTitle(title) {
  const trimmed = typeof title === 'string' ? title.trim() : ''
  return trimmed ? `${trimmed} | ${SITE_NAME}` : `${SITE_NAME} | Stronger Every Day`
}
