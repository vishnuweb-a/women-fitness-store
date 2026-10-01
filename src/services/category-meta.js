/**
 * Canonical category metadata — slugs, friendly labels, copy, and banner art.
 *
 * This module is **deliberately free of any product import**. The site header
 * and footer need the category list to build navigation, and they render on
 * every route; if that list came from `catalog.js` the whole generated catalog
 * (~440 kB of source) would be pulled into the initial load of every page,
 * including routes that never show a product. Keeping the metadata here lets
 * the navigation chrome cost three small objects instead.
 *
 * `catalog.js` re-exports `CATEGORY_META` so existing imports keep working,
 * and builds the counted `catalogCategories` list on top of it.
 *
 * These three slugs are the only categories the storefront offers. Narrower
 * groupings from the reference screens — "Yoga & Pilates", "Hydration",
 * "Recovery", "New Arrivals", "Sale" — are not created: no field in the source
 * supports them reliably, so the links would lead to empty collections.
 */
export const CATEGORY_META = {
  'women-sportswear-clothing': {
    slug: 'women-sportswear-clothing',
    label: 'Sportswear',
    longLabel: 'Sportswear Clothing',
    productType: 'clothing',
    description: 'Jackets, tops, tights and training layers built to move with you.',
    banner: '/assets/banners/banner3.webp',
  },
  'women-sports-equipments': {
    slug: 'women-sports-equipments',
    label: 'Equipment',
    longLabel: 'Sports Equipment',
    productType: 'equipment',
    description: 'Rackets, bats, rollers and training gear for every session.',
    banner: '/assets/banners/banner5.webp',
  },
  'women-sports-accessories': {
    slug: 'women-sports-accessories',
    label: 'Accessories',
    longLabel: 'Sports Accessories',
    productType: 'accessory',
    description: 'Bags, gloves, socks and the small gear that carries the work.',
    banner: '/assets/banners/banner4.webp',
  },
}

/**
 * The categories in display order, without product counts.
 *
 * Navigation uses this. Anything that needs a count uses `catalogCategories`
 * from `catalog.js`, which derives the counts from the products themselves.
 */
export const CATEGORY_NAV = Object.values(CATEGORY_META)
