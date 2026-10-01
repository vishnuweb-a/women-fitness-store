# Project Status

**Last updated:** 2026-10-02
**Current phase:** Phase 1 — landing page, storefront navigation, real product
imagery, and catalog integration (complete)
**Next phase:** Phase 2 — full collection and product-detail designs, variant
selection, and the complete cart UI

Keep this file current. It is the first thing an agent reads to learn what
actually exists.

## Phase 1 — complete

### Delivered

| Area | State |
|---|---|
| Catalog service (`src/services/catalog.js`) | Normalises the generated catalog; preserves the `products.js` interface |
| Cloudinary upload pipeline | `scripts/upload-products-to-cloudinary.mjs` — resumable, concurrency-limited, retrying, never deletes |
| Cloudinary delivery | 406/406 images uploaded; all 405 catalog references resolve remotely |
| Delivery manifest | `src/data/cloudinary-manifest.json` — public, safe metadata only |
| Local image fallback | Preserved; used automatically when an image is absent from the manifest |
| Homepage | Built from the `01 HOME` reference — hero, category rail, featured grid, collection banners, curated band, equipment section, closing banner, catalog summary |
| Header | Announcement strip, brand lockup, inline search, account/wishlist/bag with live counts |
| Navigation | Desktop category bar and mobile Sheet, both generated from real categories |
| Search | Queries the real catalog by name, brand, category, sport, material; full combobox keyboard contract |
| Collection routes | `/collections` index and `/collections/:slug` listing, with an unknown-slug state |
| Product route | Gallery, price, description, options, add-to-bag, and an unavailable-product state |
| Cart and wishlist | Browser-local, persistent, variant-aware line identity |
| Shared components | `SectionHeading`, `ProductCard`, `ProductGrid`, `ProductImage`, `CategoryCard`, `HeroBanner`, `PromotionalBanner`, `NewsletterForm`, `SearchPanel` |
| Webfonts | Inter + Archivo loaded from Google Fonts with system fallbacks |
| Banner optimisation | WebP runtime copies, 17.4 MB → 1.04 MB; originals in `banners/` untouched |
| Production asset handling | Raw product images excluded from `dist/` via a Vite plugin |
| Tests | Vitest; 20 tests covering normalisation, deduplication, and cart identity |

### Verified by running

| Check | Command / method | Result |
|---|---|---|
| Lint | `npm run lint` | **Clean — 0 errors, 0 warnings** |
| Tests | `npm test` | **20 passed / 20** |
| Production build | `npm run build` | **Succeeded** — 2495 modules, ~515 ms. 989 kB JS (211 kB gzip), 76 kB CSS (14 kB gzip) |
| Build output size | `du -sh dist` | **2.1 MB** (was 18.4 MB before banner optimisation) |
| Cloudinary upload | `node scripts/upload-products-to-cloudinary.mjs` | **406 uploaded, 0 failed** |
| Manifest coverage | Script against `products.js` | **405 / 405** catalog references resolve |
| Remote delivery | `fetch` of three transformed URLs | HTTP 200, `image/jpeg`, 15–41 kB each |
| Homepage render | Headless Chrome at 1440 / 768 / 390 | 20 product cards, 29 images, **0 broken**, 20 served by Cloudinary |
| Horizontal overflow | `scrollWidth` vs `clientWidth` | **None** at 1440, 768, or 390 |
| Search | Typed "jacket" | 4 results; ArrowDown sets `aria-selected`; Enter navigates to the product |
| Search empty state | Typed "zzzzqqq" | No-results message shown |
| Search close | Escape | Dialog removed from the DOM |
| Invalid product slug | `/products/this-does-not-exist` | Unavailable-product state rendered |
| Invalid collection slug | `/collections/nope` | "No such collection" state rendered |
| Category filtering | `/collections/women-sports-equipments` | **15 cards**, matching the catalog count |
| Required selection | Add to bag without a size | Blocked with "Select a size before adding this item to your bag." |
| Cart persistence | Add, then reload | Line survives the reload |
| Wishlist persistence | Save, then navigate | Item present on `/wishlist` |
| Mobile Sheet | 390 px | Opens with 7 links; Escape closes it |
| Keyboard | Tab from page load | First stop is "Skip to main content"; focus outline 2 px |
| Reduced motion | Chrome `reducedMotion: 'reduce'` | `h1` opacity 1, `transform: none`; product cards opacity 1 |
| Console errors | All viewports and routes | **None.** (A single transient `/favicon.ico` 404 appears in some runs — the browser's automatic request; the project ships no favicon.) |
| Secret leakage | Scan of `dist/` against all 5 secret values in `.env` | **0 leaks.** No `cloudinary://`, no `api_secret`, no service-role key |

Screenshots are in [`docs/screenshots/`](./screenshots/).

### Catalog facts, verified against the current files

44 products · 3 categories · 407 image references · 405 unique referenced
files · 406 files on disk · 9 single-image products · 0 discounted products ·
17 brands. Duplicate HRX ankle-socks ID `31105932` appears exactly once.

Full detail and provenance: [`docs/CATALOG.md`](./CATALOG.md).

> The Phase 0 handover said "10 products with only one available image". The
> measured count against the current file is **9**. The measured value is used
> throughout and is asserted by a test.

## Known limitations

- **Checkout and payment are not operational.** The cart's checkout button is
  disabled and labelled "Checkout unavailable". No payment provider is
  integrated and no card data is collected anywhere.
- **Newsletter sign-up has no backend.** Submitting validates the address and
  then states plainly that nothing was saved. It never claims success.
- **No authentication.** `/account` is still a placeholder.
- **No database schema.** No tables, no RLS policies, no seed data. Nothing was
  created in Supabase during this phase.
- **Cart and wishlist are browser-local.** They persist in `localStorage`, are
  not synced anywhere, and reserve no stock.
- **Stock is unknown for every product**, and size/colour are independent
  option lists — the valid combinations are not known. The product page says so.
- **No FITNEX reviews exist.** Scraped marketplace ratings are shown only with
  an explicit note about their origin.
- **The JS bundle is 989 kB** (211 kB gzip) because the full catalog, including
  all 407 image records, is inlined. Route-level code splitting and moving the
  catalog behind a fetch are the natural Phase 2 follow-ups.
- **`/checkout`, `/checkout/payment`, `/orders/:id/confirmation`** remain
  Phase 0 placeholders.
- **Dark mode** is defined in tokens but still has no UI toggle.
- **One image file on disk is unreferenced** by any product (406 files, 405
  referenced). It was uploaded with the rest; nothing links to it.
- **ESLint is pinned to 9.x** because `eslint-plugin-jsx-a11y` does not support
  ESLint 10.
- **`tailwind-4-docs` skill snapshot is not initialised.**

## Next phase — Phase 2

1. Full collection design: filter rail, sorting, pagination — in URL search
   params, per the routing convention.
2. Full product-detail design: specification tabs, related products, and the
   complete gallery treatment from `pages/women2.png`.
3. Variant selection backed by real availability data, once a source exists.
4. Complete cart UI and the order-summary card from the reference.
5. Route-level code splitting, and moving the catalog out of the main bundle.
