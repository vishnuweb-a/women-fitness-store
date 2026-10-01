# Project Status

**Last updated:** 2026-10-02
**Current phase:** Phase 2 — complete collection pages, product-detail pages,
cart UI, and route-level performance work (complete)
**Next phase:** Phase 3 — see "Next phase" at the end of this file

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
| Console errors | All viewports and routes | **None.** (A `/favicon.ico` 404 appeared in Phase 1; Phase 2 ships `public/favicon.svg`, so it no longer occurs.) |
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

## Phase 2 — complete

### Delivered

| Area | State |
|---|---|
| Listing query layer (`src/services/catalog-query.js`) | Pure, testable filtering, total ordering, pagination, and the URL-param contract |
| Listing hook (`src/features/catalog/use-listing.js`) | Drives a listing entirely from the URL; facet counts exclude the facet's own selections |
| Collection listing (`src/features/catalog/collection-listing.jsx`) | Shared by `/collections` and `/collections/:slug`: breadcrumbs, banner header, result count, desktop rail, mobile Sheet, sort, grid, pagination, empty state, removable filter chips |
| Filter rail (`src/features/catalog/filter-rail.jsx`) | Category, brand, price bracket, listed size, listed colour — every one backed by a real catalog field |
| Product detail | Breadcrumbs, gallery with thumbnail `tablist` + enlargement Dialog, brand/category/price, description, specifications, options, quantity, wishlist, add-to-bag feedback, related products |
| Product gallery (`src/features/product/product-gallery.jsx`) | Roving-tabindex thumbnail rail, prev/next, Radix Dialog enlargement; single-image products render without rail or arrows |
| Cart | Item photos and links, selected option labels, quantity steppers, remove, move-to-wishlist, per-line and merchandise subtotals, empty state, continue shopping, honest checkout-unavailable messaging, unavailable-line recovery |
| Cart persistence (`src/features/cart/cart-storage.js`) | v2 envelope with validation, repair, de-duplication, and migration of Phase 1 (`v1`) carts |
| Shared components | `Breadcrumbs`, `Pagination`, `QuantityStepper`, `RouteFallback`, shadcn `Dialog` |
| Category metadata (`src/services/category-meta.js`) | Navigation metadata with **no product import**, so header/footer no longer drag the catalog into every route |
| Code splitting | Homepage eager; every other route lazy. Catalog pinned to one shared chunk; `react-vendor` split for caching |
| Lazy search panel | Search (and with it the catalog) is fetched on first open rather than on every route |
| Image fallback | Finite, non-looping chain: Cloudinary -> local file (dev only) -> shipped `/assets/product-placeholder.svg` -> CSS box |
| Favicon | `public/favicon.svg`, the FITNEX chevron mark, plus `theme-color` |
| Tests | 83 tests across 3 files (was 20) |

### Verified by running

| Check | Command / method | Result |
|---|---|---|
| Lint | `npm run lint` | **Clean — 0 errors, 0 warnings** |
| Tests | `npm test` | **83 passed / 83** (20 Phase 1 + 36 listing + 27 cart) |
| Production build | `npm run build` | **Succeeded** |
| Browser suite | Headless Chrome against `vite preview`, 1440 / 768 / 390 | **48 / 48 checks passed, 0 console errors** |
| Collection filtering | Price filter on `/collections/women-sports-equipments` | Count changed from 15; URL gained `?price=...` |
| Shared URL | Opened the filtered URL in a fresh page | Reproduced the identical view |
| Back / forward | `goBack` then `goForward` | Unfiltered view, then filtered view, both restored |
| Sorting | `?sort=price-asc` | 199, 280, 699, 799, 799, 799, 849, 930, 930, 999, 999, 999 — ascending |
| Sort determinism | Same sort over a reversed input | Byte-identical order (asserted by test) |
| Pagination | Paged through every page | 44 slugs, no gaps, no repeats |
| Out-of-range page | `?page=999` | Clamped to the last page; URL corrected by `replace` |
| Filter resets paging | Filter toggled while on `?page=2` | `page` dropped from the URL |
| Invalid params | `?sort=../../etc&page=-5&category=<script>&price=free` | Normalised to the full 44-product catalog |
| Empty state | Mutually exclusive filters | "No products match these filters" plus a clear-all action |
| Mobile filter Sheet | 390 px | Opens; Escape closes; focus returns to the Filters trigger |
| Gallery keyboard | Multi-image product | 14 thumbnails, 1 tab stop, Arrow/Home/End move selection, main image follows |
| Enlargement Dialog | Expand button | Opens, focus moves inside, Escape closes, focus restored to trigger |
| Single-image product | One of the 9 | No rail, no arrows, enlargement still works, no error |
| Required option | Add to bag without a size | Blocked: "Select a size before adding this item to your bag." |
| Variant cart identity | Added size S, size M, then size S again | **Two lines** (S qty 2, M qty 1); header badge 3 |
| Cart reload | Reloaded `/cart` | Lines and options survived |
| Phase 1 cart migration | Seeded `fitnex:cart:v1`, loaded `/cart` | Both lines migrated, rewritten as v2, subtotal INR 4,493, no errors |
| Corrupt storage | Truncated JSON in `fitnex:cart:v2` | Recovered to an empty cart, no crash |
| Garbage lines | Object/array options, `-5`, `'7'`, `null`, `42` | Options discarded, quantities repaired, junk dropped |
| Missing product | Unknown product ID in storage | Shown as unavailable, **excluded from the subtotal**, removable |
| Cloudinary failure | Aborted every `res.cloudinary.com` request | Shipped placeholder rendered; **0 broken images** |
| Horizontal overflow | Collection, product, cart, home at 1440 / 768 / 390 | **None** |
| Reduced motion | `prefers-reduced-motion: reduce` | Content fully visible, nothing animated |
| Console errors | All routes and viewports | **None** |
| Secret leakage | Scan of `dist/` against every `.env` value | Service-role key, `CLOUDINARY_URL`, API key and API secret **all absent**. Only the Supabase project URL and publishable key are present, which is intended |

### Bundle measurements

Initial load means the JS referenced or module-preloaded by `dist/index.html`.

| Measure | Before (Phase 1) | After (Phase 2) |
|---|---|---|
| Initial JS, raw | 989.1 kB | **973.8 kB** |
| Initial JS, gzip | 210.7 kB | **204.6 kB** |
| Initial JS, brotli | not measured | **176.5 kB** |
| CSS, raw / gzip | 76.0 / 13.9 kB | 80.7 / 14.5 kB |
| JS chunks | 1 | 22 |
| `dist/` total | 2.1 MB | 2.2 MB |

Initial JS fell by **15.3 kB raw / 6.0 kB gzip** — while roughly **60 kB of new
Phase 2 UI** was kept out of the initial load entirely. Without splitting, the
initial bundle would have grown to about 1,034 kB rather than shrinking.

Route chunks, fetched only on navigation:

| Chunk | Raw | Gzip |
|---|---|---|
| `collection-listing` | 15.2 kB | 4.8 kB |
| `product-detail-page` | 14.9 kB | 5.0 kB |
| `cart-page` | 8.8 kB | 2.7 kB |
| `search-panel` | 8.1 kB | 3.5 kB |
| `catalog-query` | 5.1 kB | 2.1 kB |
| `collections-page` | 1.9 kB | 1.0 kB |
| `quantity-stepper` | 1.9 kB | 0.9 kB |
| `breadcrumbs` | 1.0 kB | 0.6 kB |
| `collection-detail-page` | 0.9 kB | 0.5 kB |
| wishlist / account / checkout / payment / confirmation | 0.4-0.6 kB each | |

**The catalog chunk is 392.5 kB raw but only 21.7 kB gzip / 15.9 kB brotli** —
it is repetitive URL and label strings, which compress extremely well. It was
verified to appear in **exactly one** chunk (grepped for a product ID across
every emitted file), so no route duplicates it.

> **The catalog still loads on every route, and that is deliberate.** It was
> measured, not assumed. `StoreProvider` wraps the whole app and derives cart
> names, prices, and the header badge count from the catalog at render time —
> the property that prevents a stale persisted price from ever being shown.
> Deferring the catalog would save about 16 kB brotli (9% of initial transfer;
> React alone is 88 kB) at the cost of a header badge that cannot render on
> first paint. Pinning it to one shared chunk was the better trade.

### Bugs found and fixed during Phase 2

- **Cart line keys could collide.** `lineKey` encoded "no option selected" as
  the literal string `-`, so a product whose colour is actually named `-` would
  share a line with one that had no colour selected. Segments are now
  JSON-encoded, which distinguishes `null` from `"-"` and escapes separators.
  Found by an exhaustive test over awkward option values, not by inspection.
- **The grid reveal gated content visibility.** Cards animated from
  `opacity: 0` via `whileInView`, so anything below the fold was genuinely
  invisible until an IntersectionObserver fired — including in a full-page
  screenshot or a print view. The reveal now animates transform only.
- **The mobile thumbnail strip widened the page.** `overflow-x-auto` without a
  `min-w-0` floor on its flex parent pushed the document to 1016 px at a 390 px
  viewport. Fixed and re-verified at all three widths.
- **The shadcn CLI again emitted `import { cn } from "cn"`** and installed a
  bogus `cn` package, exactly as `AGENTS.md` warns. Both corrected.

### Known cosmetic issue

The collection banner artwork in `banners/` has promotional wording baked into
the image across its full width. The project convention is that headings live
in HTML over the art, so the category heading is layered on top under a
left-to-right scrim. The scrim reduces the baked-in lettering to an unreadable
texture but does not remove it — a faint fragment is still visible in the
mid-band of the banner. It cannot be cropped out without ruining the
photograph. **The real fix is clean, text-free banner artwork**, which is a
design-asset task rather than a code change. Noted for a later phase; the
originals in `banners/` were not modified.

Screenshots are in [`docs/screenshots/`](./screenshots/), prefixed `phase2-`.

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
- **The catalog ships in the initial load on every route** (392 kB raw, but
  only 21.7 kB gzip / 15.9 kB brotli). This is a measured, deliberate trade —
  see the Phase 2 bundle note above. Moving it behind a fetch would require
  the header cart badge to tolerate a loading state.
- **`/checkout`, `/checkout/payment`, `/orders/:id/confirmation`** remain
  Phase 0 placeholders.
- **Dark mode** is defined in tokens but still has no UI toggle.
- **One image file on disk is unreferenced** by any product (406 files, 405
  referenced). It was uploaded with the rest; nothing links to it.
- **ESLint is pinned to 9.x** because `eslint-plugin-jsx-a11y` does not support
  ESLint 10.
- **`tailwind-4-docs` skill snapshot is not initialised.**

## Catalog limitations that still constrain the UI

These are unchanged by Phase 2 and continue to shape what the storefront may
say. Each is enforced in code and covered by a test.

- **Stock is unknown for every product.** No "In stock" badge, availability
  marker, scarcity cue, or delivery promise appears anywhere. The cart states
  that it reserves nothing.
- **Sizes and colours are independent lists.** Filtering or selecting an option
  finds or records a product that *lists* it. Which combinations actually exist
  is not known, and both the filter rail and the product page say so in plain
  language.
- **Selected options are catalog labels, not SKU identifiers.** Nothing in the
  cart implies a purchasable inventory record.
- **Marketplace ratings are not FITNEX reviews.** They appear only on the
  product page, attributed to the original listing. No review text, star
  summary, or customer identity is shown, because none would be real.
- **No sales rank, arrival date, or discount exists.** Sorting offers price and
  name only; "Featured" is catalog order, explicitly not a sales rank. There is
  no "Best sellers", "New arrivals", or "Sale" listing.
- **No shipping, tax, or grand total is calculated.** The cart shows a
  merchandise subtotal and reports shipping and taxes as "Not calculated".
- **No measurements, care guidance, warranty, or returns policy** is shown
  beyond the specification fields the source supplies. Missing sections are
  omitted rather than estimated.
- **Checkout and payment remain non-operational.** The checkout button is
  disabled and labelled "Checkout unavailable". There is no "Buy now" action.

## Next phase — Phase 3 (recommended)

Ordered by what unblocks the most downstream work.

1. **Supabase schema and RLS.** The storefront is still entirely client-side
   over a generated file. Model products, categories, variants, and inventory;
   enable RLS before the frontend reads anything. This is the prerequisite for
   almost everything below — read
   `.agents/skills/supabase-postgres-best-practices/SKILL.md` first.
2. **Real variant availability.** Once a variant table exists with stock, the
   product page can replace the "combinations not confirmed" caveat with actual
   availability, and option buttons can be disabled where a combination does
   not exist. Until then the current honesty constraints must stay.
3. **Move the catalog behind a query.** With a server-side catalog, the 392 kB
   chunk leaves the bundle entirely and TanStack Query takes over caching. Give
   the header cart badge a loading state as part of this.
4. **Authentication and a server-side cart**, so a bag survives a device change
   rather than living in one browser.
5. **Checkout** — only after 1, 2, and 4. It must not be built on the current
   local cart, and no payment UI should appear before a provider is integrated.
6. **Smaller follow-ups:** a dark-mode toggle (tokens already exist), an
   `og:image` and richer metadata, and a `prefers-reduced-data` path for
   imagery.
