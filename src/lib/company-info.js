/**
 * The operating company's official details.
 *
 * The single source for the company name, registered address, phone, email,
 * and website shown anywhere on the storefront — the footer, the contact page,
 * the policy pages, and the canonical URLs. Change a detail here and every
 * surface follows; never repeat one of these strings in a component.
 *
 * These were supplied by the owner and are used exactly as given. Nothing
 * beyond them — GSTIN, CIN, registration date, opening hours, a second
 * address — has been supplied, so none is stated anywhere on the site.
 */

export const COMPANY_INFO = {
  legalName: 'AURELIX PRIVATE LIMITED',
  address: 'H No. 9/149, Gandhi Nagar, Shyam Block, East Delhi, New Delhi, Delhi-110031',
  /** Ten-digit Indian mobile number, without the country code. */
  phone: '8796636233',
  email: 'aurorelix12@gmail.com',
  website: 'https://www.aurelix.fun/',
}

/** The phone number as displayed: `+91 8796636233`. */
export const COMPANY_PHONE_DISPLAY = `+91 ${COMPANY_INFO.phone}`

/** `tel:+918796636233` */
export const COMPANY_PHONE_HREF = `tel:+91${COMPANY_INFO.phone}`

/** `mailto:aurorelix12@gmail.com` */
export const COMPANY_EMAIL_HREF = `mailto:${COMPANY_INFO.email}`

/** The website without a trailing slash, for composing canonical URLs. */
export const SITE_ORIGIN = COMPANY_INFO.website.replace(/\/+$/, '')

/** The website as displayed: `www.aurelix.fun`. */
export const SITE_DISPLAY = SITE_ORIGIN.replace(/^https?:\/\//, '')
