# Project Status

**Last updated:** 2026-10-02
**Current phase:** Phase 5 — final frontend polish, accessibility,
performance, and end-to-end QA (complete)
**Next phase:** Backend. The frontend demonstration is finished; what remains
is Supabase schema, authentication, real variant availability, and order
creation. See "Next phase" at the end of this file.

The full Phase 5 record — route coverage, execution conditions, bugs fixed,
before/after measurements, and what was *not* verified — is in
[`docs/FRONTEND_FINAL_QA.md`](./FRONTEND_FINAL_QA.md).

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

### Known cosmetic issue — resolved

The collection banner artwork in `banners/` has promotional wording baked into
the image across its full width. The category tiles on `/collections` layered
an HTML heading, description, product count, arrow, and CTA on top of that
baked copy under a left-to-right scrim. The scrim reduced the baked lettering
to a texture but did not remove it, so two sets of promotional text overlapped.

**Resolved by removing the HTML overlay rather than the artwork.** The tiles
now render through the existing `PromotionalBanner` component — the same
image-only pattern the home page already uses for its collection banners: the
art is decorative (`alt=""`, `aria-hidden`), a single `Link` covers the tile,
and its accessible name ("Browse Sportswear Clothing") comes from visually
hidden text. The scrim and every HTML text layer are gone, so nothing overlaps
the baked wording.

This is a deliberate, documented exception to the "promotional text belongs in
HTML over the artwork" convention in `AGENTS.md`: it applies where the art is
text-free, and these three banners are not. **Clean, text-free banner artwork
remains the asset-side fix** that would allow the convention to apply here
again. The originals in `banners/` were not modified.

Screenshots are in [`docs/screenshots/`](./screenshots/), prefixed `phase2-`.


## Phase 3 — complete

**Scope: a frontend demonstration of the checkout screens.** No payment
provider was integrated, no order is created, no authentication was added, and
nothing in Supabase was touched. The flow says so on every screen.

### Delivered

| Area | State |
|---|---|
| Checkout schemas (`features/checkout/checkout-schema.js`) | Zod v4 schemas for delivery and billing, Indian state/UT list, tolerant `+91` phone normalisation, six-digit PIN rule, `resolveBillingAddress` |
| Checkout state (`features/checkout/checkout-state.js`) | Pure reducer, step guards, `cartSignature`, deep-frozen snapshot builder, `DEMO-`-prefixed reference generator |
| Checkout provider | `CheckoutProvider` / `CheckoutContext` / `useCheckout` + `useCheckoutSession` — the same three-way split as the cart, so Fast Refresh keeps working |
| Shared layout (`checkout-layout.jsx`) | Brand row, back-to-bag, step indicator, persistent demo notice, form + sticky summary on desktop, form-then-summary on mobile |
| Step indicator (`checkout-steps.jsx`) | `nav` + `ol`, `aria-current="step"`, completed steps are real links, per-step status in visually-hidden text |
| Order summary (`checkout-summary.jsx`) | Derived from the live catalog-backed cart on every render; merchandise subtotal only |
| Delivery step (`/checkout`) | React Hook Form + Zod, labelled fields with autocomplete and mobile keyboards, accessible errors, focus to the first invalid field |
| Billing and payment (`/checkout/payment`) | Delivery summary with Edit, "same as delivery" checkbox (on by default), alternate billing form, demo method selection, then the review |
| Payment methods (`payment-method-group.jsx`) | UPI / card / net banking as native radios in a labelled `radiogroup`, styled as cards. **No credential field of any kind** |
| Review (`checkout-review.jsx`) | Items, option labels, quantities, line subtotals, merchandise subtotal, contact, both addresses, method, Edit links |
| Confirmation (`/orders/:id/confirmation`) | Reads the frozen snapshot; demo reference, items, subtotal, method; demo-session-unavailable state for an unknown id or a reload |
| Cart entry | The checkout button is enabled and reads "Continue to demo checkout"; it stays closed while an unavailable line cannot be priced |
| Guards | Empty cart, unavailable lines, and direct entry without a draft each get an explanation and a route onward — never a silent redirect |
| Tests | 148 tests across 5 files (was 83). 65 new, covering validation, billing derivation, guards, signatures, snapshots, and references |

### Verified by running

| Check | Command / method | Result |
|---|---|---|
| Lint | `npm run lint` | **Clean — 0 errors, 0 warnings** |
| Tests | `npm test` | **148 passed / 148** (83 existing + 65 new) |
| Production build | `npm run build` | **Succeeded** — 2620 modules |
| Checkout flow suite | Headless Chrome against `vite preview` | **75 / 75 checks passed, 0 console errors** |
| Responsive / a11y suite | Headless Chrome, 1440 / 768 / 390 | **33 / 33 checks passed, 0 console errors** |
| Empty-cart checkout | `/checkout` and `/checkout/payment` with an empty bag | Explained, with a link back to the bag. No redirect |
| Invalid delivery fields | Bad email, 5-digit phone, 2-digit PIN, empty names | All four reported; focus moved to the email field; `aria-invalid`, `aria-describedby`, and `role="alert"` all wired |
| Valid delivery | Complete form | Advanced to `/checkout/payment`; phone normalised to `+91 98765 43210` |
| Back navigation | Payment to Edit to delivery | Every field retained, including the state `select` |
| Full reload | Reload of `/checkout` | Draft dropped, delivery step shown empty — the intended privacy behaviour |
| Alternate billing | Unchecked "same as delivery", submitted empty | Blocked with per-field errors; focus moved to the first invalid billing field |
| Hidden billing form | Re-checked "same as delivery" with the alternate form half-filled | Did **not** block progression |
| Billing derivation | Edited delivery city to Pune after choosing "same as delivery" | Billing followed to Pune / 411001; no stale Bengaluru copy |
| Payment method required | Review without a selection | Blocked: "Select a payment method to continue." |
| Radio group | Keyboard | Labelled `radiogroup`, 3 native radios sharing a name; ArrowDown moves; Space selects |
| Review contents | Completed review | 3 items, option labels, contact, address, method, subtotal INR 3,897 |
| Review focus | Review appearing | Focus moved to the review heading |
| Cart change mid-checkout | Raised a quantity in the bag, returned in-app | Summary refreshed; the review was withdrawn until the new items were confirmed |
| Completion | "Complete demo checkout" | Navigated to `/orders/DEMO-.../confirmation`; reference in the URL matched the one shown |
| Confirmation honesty | Scan for affirmative claims and actions | No "order confirmed", paid status, order number, estimated delivery, or track/invoice/download action |
| Cart after completion | `localStorage` and `/cart` | **2 lines intact.** The bag was not emptied |
| Confirmation reload | Reloaded the confirmation URL | Demo-session-unavailable state, explained |
| Unknown id | `/orders/NOT-A-REAL-ID/confirmation` | Same state; the id was **not** echoed and no order was fabricated |
| Direct entry | `/checkout/payment` with no draft | "Delivery details needed", with a route to the delivery step |
| **Personal-data leakage** | Dumped `localStorage`, `sessionStorage`, cookies, and the URL after a completed demo checkout | **0 leaks.** Only `fitnex:cart:v2` and `fitnex:wishlist:v1` present; no cookies. Email, name, phone, and both addresses absent everywhere |
| Horizontal overflow | Delivery, payment, alternate billing, review, confirmation at 1440 / 768 / 390 | **None** |
| Touch targets | Checkout controls at all three widths | All at least 44px |
| Keyboard | Tab through the payment step | 44 stops, every one rendered and non-zero; 2px solid focus ring |
| Heading structure | Every checkout surface | Exactly one `h1`, exactly one `main`, no skipped levels |
| Reduced motion | `prefers-reduced-motion: reduce` | Delivery form, review, and confirmation all fully visible, `transform: none`. Nothing hidden by animation |
| Console errors | Every checkout route and viewport | **None** |

Screenshots are in [`docs/screenshots/`](./screenshots/), prefixed `phase3-`.

### Bugs found and fixed during Phase 3

Each was found by running the thing, not by reading it.

- **The sticky header covered the top of each new step.** Submitting the
  delivery form left the page at y=92 while the header's lower edge sat at
  146, so the new step's heading and its "Back to bag" link were both behind
  the header — and the link was not clickable, because the header was over it.
  Caught when a scripted click on "Back to bag" landed on the header's "Shop
  All" instead. Each step now scrolls to the top on entry.
- **Two `main` landmarks.** `CheckoutLayout` rendered its own `main` inside the
  one `RootLayout` already provides. Now a `div`.
- **Focus never reached the review heading.** `AnimatePresence mode="wait"`
  unmounts the form before mounting the review, so the parent's focus effect
  ran while the heading did not yet exist and focus silently stayed on `body`.
  Focus now happens in the review's own mount effect.
- **`h1` followed by `h3` on the payment step.** `AddressSummary` hardcoded
  `h3`, and a `legend` is not a heading, so there was no `h2` to nest under.
  The heading level is now a prop set per call site.
- **The hidden billing form blocked progression.** `addressSchema.partial()`
  still ran its own field rules, so a half-filled alternate form failed
  validation while invisible — attaching errors to inputs that were not on
  screen to fix. Caught by a test written before the browser pass. The field is
  now unvalidated at the schema level and gated solely by `superRefine`.
- **The alternate billing address was not trimmed.** `z.unknown()` passes its
  input through, so billing kept whatever whitespace was typed while delivery
  was trimmed — the same address would have rendered differently on the review.
  Fixed with a `transform`.
- **A stale review was clickable for one frame.** Resetting the review mode
  from an effect rendered it once before retracting it. It is now derived at
  render from the request and the cart signature together.
- **Checkout actions were 40px tall.** The shadcn `lg` size is `h-10`. Raised
  locally to 44px rather than changing the shared primitive for every route.

### Demo limitations and backend integration points

These are the seams a real checkout would be built on. Each is a deliberate
absence, not an oversight.

| Area | Current behaviour | What connecting a backend would supply |
|---|---|---|
| Orders | A frontend-only `DEMO-...` reference and an in-memory snapshot | An orders table, a real order number, and server-side persistence |
| Payment | A recorded method *preference*; no provider contacted | A payment provider, a PCI boundary, and an authorisation result |
| Pricing | Merchandise subtotal only, in integer paise from the catalog | Server-side pricing, promotions, and a payable total |
| Shipping | "Not calculated"; no rates, carriers, dates, or method choice | Rate quotes, serviceability by PIN code, and lead times |
| Tax | "Not calculated" | GST rules by place of supply |
| Inventory | Nothing is reserved; stock is unknown for every product | Stock checks and reservation at checkout |
| Address | Format validation only | Address verification and delivery-coverage lookup |
| Identity | No authentication; the draft is per-tab and in memory | Accounts, saved addresses, and order history |
| Confirmation | Lost on reload, by design | A persisted order the confirmation can look up |

## Phase 4 — complete

**Scope: the customer, wishlist, and support frontend, without
authentication.** No sign-in, registration, password reset, route protection,
or Supabase Auth was built; none was in scope. Nothing was changed in
Supabase, no asset was uploaded, and nothing was committed or pushed.

Full detail: [`docs/CUSTOMER_PAGES.md`](./CUSTOMER_PAGES.md).

### Delivered

| Area | State |
|---|---|
| Customer state (`features/customer/customer-state.js`) | Pure reducer for the profile and address previews, plus `ensureOneDefault`, `getDefaultAddress`, `profileDisplayName` |
| Customer provider | `CustomerProvider` / `CustomerContext` / `useCustomer` — the same three-way split as the cart and checkout. In memory only |
| Customer schemas (`customer-schema.js`) | Profile rules; address preview **reusing** the checkout `addressSchema`, state list, and phone normalisation |
| Customer layout | One `nav`: sticky sidebar from `lg:` up, horizontal scroller below. One `aria-current="page"` |
| Customer hub (`/account`) | Replaces the Phase 0 placeholder. A card per section with an honest status line. No identity, membership, points, or order count |
| Profile preview (`/account/profile`) | Name, email, phone. "Apply to preview", cancel, clear. Accessible errors, focus to the first invalid field, focus restored to the trigger |
| Address preview (`/account/addresses`) | Empty state, add/edit form, cards, delete confirmation dialog, default selection, labels (Home / Work / custom) |
| Demo orders (`/account/orders`) | Reads the checkout provider's frozen snapshots — no second order store. Labelled "Demo checkout"; links to the existing confirmation route |
| Wishlist (`/wishlist`) | Responsive cards, count, remove, product links, empty state, unavailable-product section, live-region feedback, option-choice routing |
| Wishlist store additions | `removeFromWishlist`, `unavailableWishlistIds`. Storage key and format unchanged |
| Support pages | `/help`, `/contact`, `/shipping`, `/returns`, `/privacy`, `/terms` on a shared layout with a visible policy-status banner |
| Storefront chrome | Announcement bar and footer no longer assert free shipping or 30-day returns; footer gained Customer and Help columns |
| Button `lg` size | Raised from `h-10` (40px) to `h-11` (44px) at the primitive |
| Tests | 229 tests across 9 files (was 148). 81 new |

### Verified by running

| Check | Command / method | Result |
|---|---|---|
| Lint | `npm run lint` | **Clean — 0 errors, 0 warnings** |
| Tests | `npm test` | **229 passed / 229** (148 existing + 81 new) |
| Production build | `npm run build` | **Succeeded** |
| Browser suite | Headless Chrome against `vite preview`, 1440 / 768 / 390 | **216 / 216 checks passed, 0 console errors** |
| Heading structure | Every customer and support route | Exactly one `h1`, exactly one `main`, no skipped levels |
| Current-page nav | `/account/profile` | Exactly one `aria-current="page"`, on the right entry |
| Profile validation | Empty submit | 4 errors; focus moved to the first invalid field; `aria-invalid` and `aria-describedby` wired |
| Profile validation | Bad email, 5-digit phone | Both reported, nothing else |
| Profile apply | Valid submit | Values shown, phone normalised to `+91 98765 43210`, announced in a live region, focus restored to Edit |
| Address default | First address added | Became the default automatically |
| Address default | Second added, then switched | Exactly one default throughout |
| Address deletion | Deleted the default | Another address promoted; exactly one default remained |
| Delete dialog | Opened, Escape | Focus moved inside; Escape closed it; focus restored to the Delete trigger |
| Reload | `/account/addresses`, `/account/profile` | Previews cleared, empty states shown |
| Demo orders empty | No completed checkout | "No real orders yet. Checkout currently runs in demo mode." |
| Demo orders filled | Completed a demo checkout, navigated in-app | Entry appeared, labelled "Demo checkout", with reference, items, subtotal, method |
| Demo order detail | "View details" | Opened `/orders/DEMO-.../confirmation` — the existing route |
| Demo orders reload | Reloaded the list | Empty again, as designed |
| Unknown reference | `/orders/NOT-A-REAL-ID/confirmation` | Demo-session-unavailable state; id not echoed |
| Wishlist | Saved 3, removed 1, reloaded | Count correct, removal announced, survived the reload |
| Wishlist unavailable | Injected an unknown id into storage | Explained in its own section and removable |
| Wishlist options | Multi-option products | "Choose options" routed to the product page; no variant invented |
| Contact form | Submitted a complete message | Never claimed success; stated it was not sent; **0 network requests** |
| Policy status | All four policy pages | Status banner present on the page |
| Policy honesty | Shipping / returns | No timeframe, fee, coverage, or return window stated |
| Privacy honesty | Privacy page | Does not claim no data leaves the browser; names Cloudinary, Google Fonts, and the host; names the two real storage keys |
| **Personal-data leakage** | Dumped `localStorage`, `sessionStorage`, cookies, and the URL after profile, address, contact, and a demo checkout | **0 leaks.** Only `fitnex:cart:v2` and `fitnex:wishlist:v1`; no cookies. Name, email, phone, and address absent everywhere |
| Touch targets | All 11 routes at 1440 / 768 / 390 | All at least 44px (18 real 36px violations found and fixed) |
| 40px button issue | Product add-to-bag row | Now 44px |
| Primary shopping controls | `/`, `/collections`, `/cart` at 390 | All at least 44px |
| Horizontal overflow | All 11 routes at 1440 / 768 / 390 | **None** |
| Focus visibility | Tab on `/account` | 2px solid focus ring |
| Reduced motion | `/account`, `/account/profile`, `/wishlist`, `/help` | Fully visible, nothing hidden by animation |
| Direct entry | All 11 routes in a fresh tab | Rendered, no page errors |
| Dead controls | All 11 routes | No link with a missing or `#` href |
| Regression | `/`, `/collections`, `/cart`, `/checkout` | All still render |
| Console errors | Every route and viewport | **None** |

Screenshots are in [`docs/screenshots/`](./screenshots/), prefixed `phase4-`.

### Bugs found and fixed during Phase 4

Each was found by running the thing.

- **Eighteen controls were 36px tall.** The shadcn `default` button size is
  `h-9`, and the new customer, wishlist, and contact actions used it — below
  the 44px minimum at every viewport. Caught by measuring every control on
  every route rather than by inspection. The page actions now use `lg`.
- **The reported 40px issue was in the `lg` size itself.** `lg` was `h-10`,
  and every existing call site was already patching it back to 44px with a
  local `min-h-11` — except the product page's **Add to bag** and **Save**,
  which were therefore 40px. Fixed at the primitive rather than at each call
  site. `default` and `sm` were left alone deliberately: inflating them would
  wreck the density of the filter rail and the listing toolbar.
- **The announcement bar and footer asserted policies the policy pages deny.**
  "Free shipping on orders over ₹999" and "30-day easy returns" appeared on
  every page of the site while `/shipping` and `/returns` state that no policy
  has been set. Both replaced with supportable statements that link to the
  real status.
- **The contact page overclaimed.** It said "Nothing leaves your browser",
  which is false for a page served over the network with third-party fonts and
  images. It now states precisely what the button does not send, and points at
  the privacy page for what the page itself requests.
- **A ref was read during render.** `handleSubmit(onSubmit, onInvalid)` is
  evaluated at render time and `onSubmit` closed over the focus ref, which the
  React Compiler lint rule rejects. The handler is now wrapped so the call
  happens on the event.
- **Focus restoration used a setState-in-effect.** Returning focus to the Edit
  and Add buttons after closing a form is now done with `flushSync` in the
  handler, which commits the unmount before the focus call and avoids the
  cascading render the lint rule flags.
- **The wishlist silently dropped saved products that left the catalog.** They
  vanished with no explanation. They are now reported and removable, and
  `wishlistCount` counts only renderable products so the header badge matches
  the page.

### Demo limitations and backend integration points

Tabulated in [`docs/CUSTOMER_PAGES.md`](./CUSTOMER_PAGES.md). In short: the
profile, addresses, and demo orders are session-only previews; the wishlist is
browser-local; the contact form has no endpoint; and the shipping, returns,
privacy, and terms pages are explicitly unset or draft, pending merchant and
legal review.

## Known limitations

- **Checkout is a frontend demonstration, not a transaction.** The screens are
  built and usable, but no payment provider is integrated, no order is created,
  nothing is persisted server-side, and no card, UPI, or banking credential is
  collected anywhere. Completing the flow produces a `DEMO-` reference held in
  memory for one page session. Every screen states this.
- **The demo checkout keeps personal data in memory only.** Contact and address
  values are never written to `localStorage`, `sessionStorage`, cookies, the
  URL, logs, or the cart storage, and are lost on reload by design. Verified by
  dumping all persistent storage after a completed demo checkout.
- **Newsletter sign-up has no backend.** Submitting validates the address and
  then states plainly that nothing was saved. It never claims success.
- **No authentication.** No sign-in, registration, password reset, route
  protection, or Supabase Auth exists. `/account` is now a Customer Hub
  (Phase 4) that previews the customer areas without implying an account.
- **The customer previews are session-only.** Profile and address values live
  in memory for one page session and are cleared on reload. They are never
  written to storage, cookies, the URL, logs, or Supabase, and are never
  copied into checkout.
- **Demo order history is session-only.** `/account/orders` reads the
  checkout provider's in-memory snapshots, so it is empty after a reload.
- **The contact form cannot send a message.** No submission endpoint is
  configured, and no contact details are published because none are set. The
  page states this before anything is typed and never reports success.
- **Shipping and returns policies are not set**, and the privacy and terms
  pages are clearly-marked drafts describing observed behaviour, pending
  merchant and legal review.
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
- **`/checkout`, `/checkout/payment`, `/orders/:id/confirmation`** are
  implemented as a demonstration (Phase 3). They route, validate, and render,
  but transact nothing. The confirmation cannot survive a reload, because there
  is no order to look up.
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
- **Checkout demonstrates the screens without transacting.** The cart action
  reads "Continue to demo checkout". The flow shows no payable grand total, no
  delivery date, no shipping rate, and no payment-credential field, and the
  confirmation shows no paid status, invoice, tracking, or delivery promise —
  because none of those exist. There is no "Buy now" action.

## Phase 5 — complete

Final frontend polish, accessibility, performance, and end-to-end QA. One
sweep across every route rather than one feature. Full record:
[`docs/FRONTEND_FINAL_QA.md`](./FRONTEND_FINAL_QA.md).

### Verified

Everything below was run against the **production build** served by
`npm run preview`, in Chromium via Playwright, with axe-core for the
automated accessibility audit. Playwright and axe were installed outside the
repository; no test-only dependency was added to `package.json`.

| Check | Result |
|---|---|
| `npm run lint` | Clean — 0 errors, 0 warnings |
| `npm test` | **234 passed** (229 baseline + 5 added) |
| `npm run build` | Succeeds |
| Route audit, 24 cases x 4 viewports (360/390/768/1440) | 96 combinations; **0 horizontal overflow, 0 console errors, 0 page errors**, one `h1` and one `main` per route, every `img` with `alt` |
| axe-core (wcag2a/2aa/21a/21aa), 48 runs | **0 violations** |
| End-to-end journey | 18/18 — home, search, collection, product, options, bag, cart, demo checkout, review, confirmation, demo orders |
| Keyboard, focus, 200% zoom, reduced motion | 14/14 |
| Gallery, variants, wishlist | 9/9 |
| Link integrity | 53 internal links, **0 broken**, 0 without an accessible name |
| Privacy | **No PII** in localStorage, sessionStorage, cookies, request URLs, or request bodies |
| Credentials in `dist/` | **None** — no service-role key, no API secret; only the browser-safe publishable key |

### Fixed

- **118 colour-contrast failures (serious).** `--primary` moved from
  `brand-500` to `brand-600` (white text 3.84:1 to **4.88:1**) and
  `--muted-foreground` darkened to `oklch(0.52 0 0)` (4.31:1 to **4.99:1** on
  the `#f4f4f4` surfaces). Three `bg-brand-500` badges moved to `brand-600` to
  match. Ratios were measured, not estimated. **118 to 0.**
- **Every route served an identical `<title>` and description.** All 20 routes
  shipped the same tab title, so history, bookmarks, and screen-reader page
  announcements were indistinguishable. Added
  `src/components/shared/page-meta.jsx` using React 19 native metadata
  hoisting, with composition in `src/lib/page-title.js`. **All 24 route cases
  now have a distinct title.** Three follow-on bugs fixed while verifying:
  duplicate tags (React appends rather than replaces, so the static tags in
  `index.html` doubled every page), three titles on `/collections`, and no
  metadata on the checkout empty-bag guard. (With an empty bag `/checkout` and
  `/checkout/payment` share the guard's title by design; with items in the bag
  they differ, which was verified separately.)
- **Home LCP 5292 ms to 2132 ms (-60%)** on a throttled 1.6 Mbps / 150 ms
  profile, median of five runs; collection **3816 ms to 2404 ms (-37%)**. The
  banner is each page's LCP element and React renders it, so the browser could
  not discover it until the CSS and entry chunk had parsed. Fixed with a
  route-aware preload. Two earlier attempts were measured and rejected: an
  unconditional `<link>` in `index.html` cost the collection pages 512 ms by
  preloading an image they never use, and a React-rendered `<link>` runs too
  late to help at all.
- **Baked-in banner text legible beside the HTML heading** on the equipment
  category header. Scrim stops retuned so the baked words become an unreadable
  smudge; a stronger scrim was rejected for swallowing the photograph.

### Known trade-offs and limits

- Home **FCP regressed 1624 ms to 2116 ms** as the direct cost of the LCP fix:
  the hero now shares bandwidth with the stylesheet instead of queueing behind
  it. Accepted deliberately — the hero *is* the first large thing worth seeing.
- Initial transfer grew **+313 B gzip (+0.13%)**, the cost of per-route
  metadata and the preload script.
- `index.html` no longer carries a static `<title>`, so a client that runs no
  JavaScript gets none. That client gets no content either; prerendering or SSR
  is the fix and is a hosting change.
- **No real screen reader, no Firefox or WebKit, no real device, no Lighthouse
  or field data.** An automated axe pass does not prove accessibility. The full
  list of unverified checks is section 10 of
  [`docs/FRONTEND_FINAL_QA.md`](./FRONTEND_FINAL_QA.md).

### Deployment readiness

Per-route titles, descriptions, and Open Graph / Twitter tags ship. A favicon
ships. `noindex, nofollow` covers the cart, the demo checkout, the
confirmation, all `/account/*` previews, and the not-found states.

**No canonical URL, `og:url`, or `og:image`** — this build has no production
domain and no social-preview asset, and inventing either would put a wrong URL
into every share card.

**SPA deep links require a hosting rewrite** (serve `/index.html` with a 200
for any non-file path). Per-host configuration and the indexing changes needed
before a real launch are in section 8 of
[`docs/FRONTEND_FINAL_QA.md`](./FRONTEND_FINAL_QA.md).

Nothing was deployed, committed, or pushed.

## Next phase — backend

The frontend demonstration is complete. Everything that remains before this is
a real store is server-side work, ordered by what unblocks the most downstream.

1. **Supabase schema and RLS.** Still the prerequisite for everything
   server-side. Model products, categories, variants, inventory, addresses, and
   orders; enable RLS before the frontend reads anything. Read
   `.agents/skills/supabase-postgres-best-practices/SKILL.md` first.
2. **Authentication.** Needed before the Phase 4 customer pages can be more
   than previews, and before a cart, wishlist, or address can follow someone
   between devices. The seams are tabulated in
   [`docs/CUSTOMER_PAGES.md`](./CUSTOMER_PAGES.md); access must be enforced
   server-side, with any client-side guard a convenience on top.
3. **Real variant availability.** Once a variant table carries stock, the
   product page can drop the "combinations not confirmed" caveat and checkout
   can verify inventory rather than stating that it cannot.
4. **Move the catalog behind a query.** With a server-side catalog the 392 kB
   chunk leaves the bundle and TanStack Query takes over caching. The header
   cart badge needs a loading state as part of this.
5. **Make checkout real — only after 1, 2, and 3.** The integration points are
   tabulated at the end of the Phase 3 section above. A payment provider is the
   last step, not the first: no payment UI should appear before one exists, and
   no payment credential should ever be collected in this bundle.
6. **Commercial and legal policy.** Shipping, returns, privacy, and terms are
   marked drafts or explicitly unset because the merchant has set none. They
   need real decisions, not placeholder text.
7. **Prerendering or SSR**, so a crawler that does not execute JavaScript sees
   a title and content.
8. **Smaller follow-ups:** clean text-free banner artwork (still outstanding,
   a design-asset task — the current banners carry baked-in promotional text
   that the scrim only mitigates), responsive/optimised banner images (they are
   ~2.5x oversized today), an `og:image`, a dark-mode toggle (tokens already
   exist, and the `.dark` block has never been contrast-checked), and a
   `prefers-reduced-data` path for imagery.
