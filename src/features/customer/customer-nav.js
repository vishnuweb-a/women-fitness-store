/**
 * Customer-section constants.
 *
 * Kept out of `customer-layout.jsx` so that file exports only components and
 * Fast Refresh keeps working — the same split as `store-context.js`.
 */
import { Heart, LifeBuoy, MapPin, Receipt, UserRound } from 'lucide-react'

/** The customer hub's sections. Every entry points at a route that exists. */
export const CUSTOMER_NAV = [
  { label: 'Customer hub', to: '/account', icon: UserRound, end: true },
  { label: 'Profile preview', to: '/account/profile', icon: UserRound },
  { label: 'Address preview', to: '/account/addresses', icon: MapPin },
  { label: 'Demo orders', to: '/account/orders', icon: Receipt },
  { label: 'Wishlist', to: '/wishlist', icon: Heart },
  { label: 'Help and support', to: '/help', icon: LifeBuoy },
]


/**
 * The sentence every customer surface repeats.
 *
 * A constant rather than prose typed per page, for the same reason
 * `DEMO_NOTICE` is one: this is the claim the whole section depends on being
 * accurate, and it must not drift between screens.
 */
export const CUSTOMER_NOTICE =
  'Account persistence is not connected. Anything you enter here stays in this browser tab for this session only and is cleared when you reload.'

