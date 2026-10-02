/**
 * Support-section constants.
 *
 * Kept out of `support-layout.jsx` so that file exports only components and
 * Fast Refresh keeps working.
 */
/** The support section's pages. Every entry points at a route that exists. */
export const SUPPORT_NAV = [
  { label: 'Help centre', to: '/help' },
  { label: 'Contact', to: '/contact' },
  { label: 'Shipping', to: '/shipping' },
  { label: 'Returns', to: '/returns' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
]
