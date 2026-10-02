# Frontend Final QA — Phase 5

**Date:** 2026-10-02
**Phase:** 5 — final frontend polish, accessibility, performance, end-to-end QA
**Build under test:** production build (`npm run build`), served by
`npm run preview` on `http://localhost:4173`

This document records what was checked, how it was checked, what was fixed,
and — as importantly — what was *not* verified. A check that was not run is
listed as not run, not as passed.

---

## 1. Execution conditions

Everything below was exercised against the **production build**, not the dev
server.

| Item | Value |
|---|---|
| Browser | Chromium (Playwright, headless) |
| Viewports | 360×740, 390×844, 768×1024, 1440×900 |
| Zoom check | 720×450 CSS px at `deviceScaleFactor: 2` (≈200% of 1440) |
| Throttled profile | 1.6 Mbps down, 150 ms RTT, via CDP `Network.emulateNetworkConditions` |
| Accessibility engine | axe-core, tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` |
| Host OS | Windows 11 |

Playwright and axe-core were installed **outside the repository**, in a
scratch directory. No test-only dependency was added to `package.json`.

**These are emulated conditions on one machine, in one engine.** They are not a
substitute for real devices, real networks, or a real screen reader. See
§8 for what that leaves unverified.

---

## 2. Baseline verification

The Phase 4 baseline was re-verified before anything was changed, rather than
taken on trust.

| Claim | Result |
|---|---|
| 44 products across 3 categories | **Confirmed** — 44 total; 15 sportswear, 15 equipment, 14 accessories |
| 405 unique images | **Confirmed** |
| Cloudinary delivery with a shipped production fallback | **Confirmed** — see §6 |
| URL-driven filters, sorting, pagination | **Confirmed** — see §4 |
| Persistent local cart and wishlist | **Confirmed** — `fitnex:cart:v2`, `fitnex:wishlist:v1` |
| In-memory checkout / profile / addresses / demo snapshots | **Confirmed** — nothing persisted; see §7 |
| No authentication, no database-backed orders | **Confirmed** — no auth exists; `public` schema still empty |
| 229 passing tests | **Confirmed** — 229 before this phase, 234 after (5 added) |
| Working customer and support pages | **Confirmed** |

All of these behaviours are preserved by this phase.

---

## 3. Route and feature coverage

**24 route cases × 4 viewports = 96 combinations audited.** Every registered
route, plus the invalid-URL cases.

| Route | Covered | Notes |
|---|---|---|
| `/` | yes | Home; LCP element is the hero banner |
| `/collections` | yes | Index + embedded full listing |
| `/collections/women-sportswear-clothing` | yes | |
| `/collections/women-sports-equipments` | yes | |
| `/collections/women-sports-accessories` | yes | |
| `/collections/<unknown>` | yes | Honest "Collection not found" state |
| `/products/<valid slug>` | yes | Gallery, options, add to bag |
| `/products/<unknown slug>` | yes | Honest "Product not available" state |
| `/cart` | yes | Empty and populated states |
| `/checkout` | yes | Both the empty-bag guard and the form |
| `/checkout/payment` | yes | Billing, method, review |
| `/orders/<id>/confirmation` | yes | Both a live snapshot and a missing one |
| `/account` | yes | |
| `/account/profile` | yes | |
| `/account/addresses` | yes | |
| `/account/orders` | yes | |
| `/wishlist` | yes | |
| `/help`, `/contact` | yes | |
| `/shipping`, `/returns`, `/privacy`, `/terms` | yes | |
| `*` (not found) | yes | |

**Link integrity:** 53 distinct internal links across all routes. Every one
resolves to a real route; **0 broken links, 0 links without an accessible
name, 0 external links.**

---

## 4. Verified checks

### Navigation and interaction — 18/18 passed

- Valid and invalid product and category URLs render their intended states.
- Search opens, queries the real catalog (`"jacket"` → 4 options), and
  `ArrowDown` moves the active option; `Escape` closes.
- A filter writes to the URL (`?brand=…`); **back** restores the unfiltered
  URL and **forward** restores the filtered one.
- `?sort=price-asc` drives the sort `<select>` from the URL.
- Add to bag updates the header bag count.
- **Variant-aware cart lines confirmed:** adding size S and size M of the same
  product produces two separate lines, not one of quantity 2.
- Quantity stepper increments and the subtotal follows.
- **Integer-paise subtotals confirmed:** ₹799 + ₹799 → ₹1,598, no fractional
  rupee rendered anywhere in the bag.
- The payment step is guarded before delivery is complete.
- Invalid input sets `aria-invalid` and announces through `role="alert"`.
- Review step is reachable and labelled as a demonstration; "Back to billing"
  returns to the editable step.
- Demo completion reaches `/orders/DEMO-…/confirmation`.
- **Demo completion does not clear the cart** — verified directly in
  `localStorage` after completion.
- Reloading a confirmation shows an honest recovery state rather than a
  fabricated order.
- Help, contact, and policy links all resolve.

### Accessibility — 14/14 manual checks passed, axe clean

- **axe-core: 0 violations** across 48 route×viewport runs (1440 and 390),
  after the contrast fixes in §5.
- Exactly one `<h1>` per route on all 96 combinations.
- One `<main>` landmark per route; header/nav/footer present.
- Every `<img>` has an `alt` attribute on all 96 combinations.
- First `Tab` reaches the skip link; `Enter` moves focus to `#main-content`.
- A visible focus indicator on every sampled focusable element (25 per page,
  0 without).
- The sticky header does not overlap any focused product link when scrolled.
- The mobile nav Sheet traps focus (0 escapes in 14 tabs), closes on
  `Escape`, and **restores focus to its trigger**.
- No interactive target below 24px at 390px.
- **No horizontal overflow at 360, 390, 768, or 1440px** — zero offenders on
  all 96 combinations.
- **No horizontal overflow at ~200% zoom** on home, collection, cart,
  checkout, and help.
- `prefers-reduced-motion: reduce` produces **zero** long animations or
  transitions, and no page errors.
- Product gallery: a correct roving-tabindex contract — exactly one tab with
  `tabindex="0"` of ten, `ArrowRight` moves selection, `End` jumps to last.

**An automated pass does not prove accessibility.** axe cannot judge whether
alt text is *meaningful*, whether focus order is *logical*, or how a real
screen reader announces a flow. See §8.

### Console and runtime

**0 console errors, 0 page errors, 0 navigation failures** across all 96
combinations and all functional suites.

---

## 5. Bugs found and fixed

### 5.1 Colour contrast below WCAG AA — 118 nodes (serious)

Found by axe across 48 route×viewport runs. Two token-level root causes:

| Surface | Before | After | Fix |
|---|---|---|---|
| White text on the primary red button | `#f52834` — **3.84:1** | `#de0019` — **4.88:1** | `--primary` moved from `brand-500` to `brand-600` |
| Muted text on `#f4f4f4` surfaces | `#737373` — **4.31:1** | `#696969` — **4.99:1** | `--muted-foreground` darkened to `oklch(0.52 0 0)` |

Three further surfaces used `bg-brand-500` with white text directly and were
moved to `brand-600` to match: the header cart/wishlist count badge, the
pagination current-page button, and the collection filter-count chip.

Ratios were measured by rasterising each `oklch()` value through a canvas and
computing the WCAG contrast formula, not estimated. **Result: 118 → 0.**

### 5.2 Every route served an identical `<title>` and description

The most substantive defect found. All 20 routes shipped
`FITNEX WOMEN | Stronger Every Day` and one generic description, so a browser
tab, a history entry, and a bookmark were indistinguishable, and a screen
reader announced the same page name after every navigation.

Fixed with `src/components/shared/page-meta.jsx`, using React 19's native
metadata hoisting (no helper library, no effect that races route changes).
Title composition lives in `src/lib/page-title.js` so it is testable in the
Node test environment and does not break Fast Refresh.

**All 24 route cases now have a distinct, descriptive title**, with one
intended exception: with an empty bag, `/checkout` and `/checkout/payment`
both render the same "Nothing to check out" guard and so share its title.
Once the bag has items they differ — "Delivery information" and "Billing and
payment" — which was verified separately.

Three follow-on bugs surfaced and were fixed while verifying this:

- **Duplicate tags.** React *appends* hoisted metadata rather than replacing
  it, so the static tags in `index.html` produced two `<title>` and two
  `<meta name="description">` on every page. The static tags were removed; the
  trade-off (an untitled tab before the bundle executes, and no title for a
  non-executing client) is documented in `index.html` and is a prerendering
  problem, not a frontend one.
- **`/collections` had three titles**, because the index page and the
  `CollectionListing` it embeds each rendered their own. The index's was
  removed; the listing owns it.
- **The checkout empty-bag guard had no metadata**, because it returns before
  `CheckoutLayout` renders. `CheckoutBlocked` now carries its own.

### 5.3 Hero/banner LCP, and a regression introduced while fixing it

Measured, not assumed. On the throttled profile the home page's LCP was
**5292 ms** (median of 5 runs) — the worst metric in the audit. The LCP
element is the hero banner, which React renders, so the browser could not
discover it until the CSS and entry chunk had parsed.

A first attempt put a static `<link rel="preload">` in `index.html`. That
fixed home (5292 → 2172 ms) but **regressed the collection pages by 512 ms**:
`banner1.webp` was preloaded on every route, never used there, and its 111 kB
competed with the category banner that those pages actually paint.

A second attempt moved the preload into the `HeroBanner` component so React
would scope it to the home page. **Measured: it does not work** — by the time
React executes, the parser-blocking work the preload is meant to pre-empt has
already finished. Home LCP returned to 5252 ms.

The shipped fix is a small route-aware inline script in `index.html` that
appends the correct preload for the route being entered. It runs before the
bundle, and an unrecognised route preloads nothing.

| Route | Before | After | Change |
|---|---|---|---|
| Home | 5292 ms | **2132 ms** | **−60%** |
| Collection | 3816 ms | **2404 ms** | **−37%** |

**This is a trade, and it is recorded as one.** Home FCP moves the other way,
1624 ms → 2116 ms, because the hero now shares bandwidth with the stylesheet
instead of queueing behind it. On this page the two paints converge on the
same moment, and the hero *is* the first large thing worth seeing.

### 5.4 Baked-in banner text legible beside the HTML heading

`banner5.webp` (the equipment category header) has a promotional headline, a
tagline, and a fake "Shop Collection" button baked into the pixels. The
existing scrim suppressed most of it, but the tail of the tagline
("…confidence.") remained legible immediately right of the real `<h1>`.

`object-right` is already the furthest-right crop, so the crop could not help.
The scrim stops were retuned (`from-45%/via-72%` → `from-50%/via-74%`), which
reduces the baked words to an unreadable smudge.

A stronger scrim (`58%/80%`) hides the text completely — and was rejected: it
also swallows the dumbbell and most of the figure, leaving a near-black box
that is a worse banner than the artifact it removes. The shipped values are
the point where the words stop being readable and the photograph survives.

**No imagery was generated, uploaded, or replaced.** See §9.

---

## 6. Performance

### Measurement conditions

Production build via `npm run preview`. Throttled figures are the **median of
five runs** at 1.6 Mbps / 150 ms RTT. Cold context per run.

### Initial load (unchanged by this phase, by design)

| | Baseline | Final | Change |
|---|---|---|---|
| Initial transfer (8 files) | 234,331 B gzip | 234,644 B gzip | **+313 B (+0.13%)** |
| Raw | 1,104,142 B | 1,105,273 B | +1,131 B |

The +313 B is the `PageMeta` component and the route-aware preload script —
the cost of per-route metadata and the LCP fix.

| Chunk | Raw | Gzip |
|---|---|---|
| `react-vendor` | 361.0 kB | 113.8 kB |
| `index` (entry) | 229.5 kB | 71.9 kB |
| `catalog` | 392.5 kB | **20.8 kB** |
| `index.css` | 84.9 kB | 15.1 kB |
| `createLucideIcon` | 30.8 kB | 10.0 kB |
| `button`, `dist`, `rolldown-runtime` | 6.6 kB | 3.1 kB |

46 JS chunks total; `dist/` is 2.5 MB. Route-level code splitting and the
single pinned `catalog` chunk from Phase 2 are intact and working — the
catalog compresses 392 kB → 21 kB and is fetched once, not per route.

### Core metrics

| Route | Condition | FCP | LCP | CLS |
|---|---|---|---|---|
| Home | unthrottled | 228 ms | 240 ms | 0.0004 |
| Collection | unthrottled | 172 ms | 488 ms | 0.0003 |
| Product | unthrottled | 164 ms | 476 ms | 0.0002 |
| Home | throttled | 2116 ms | **2132 ms** | 0.0007 |
| Collection | throttled | 2072 ms | **2404 ms** | 0.0073 |

**CLS is effectively zero** on every route measured — the explicit
`width`/`height` on catalog images is doing its job.

### Eager imports and unused code

- **The Supabase SDK is fully tree-shaken out of the bundle.** No application
  code imports it; `GoTrueClient`, `SupabaseClient`, and `PostgrestClient`
  appear nowhere in `dist/`. Only the public project URL string survives.
- The `catalog` chunk is `modulepreload`ed on first load. This is correct and
  was left alone: the home page reads the catalog to render its product grids,
  so deferring it would delay the first meaningful paint rather than help.

### Resilience

- **Cloudinary failure produces the shipped placeholder, with no loop.** With
  `res.cloudinary.com` blocked entirely, all 12 product images on a collection
  page fall back to `/assets/product-placeholder.svg`. The placeholder is
  requested **once**. Each failing Cloudinary URL is requested exactly twice
  (the `srcset` candidate and the `src`) and never more — bounded and
  terminating, which matches the finite chain documented in `product-image.jsx`.
- Alt text degrades honestly: `"<product name> — image unavailable"`.
- Lazy routes load on demand; no route chunk is fetched on first paint.

**Not promised:** no Lighthouse score is claimed. These are Playwright/CDP
measurements on one machine under emulated throttling.

---

## 7. Truthfulness and privacy audit

### Unsupported claims — none found in rendered output

Every route's rendered text was scanned for 18 claim patterns: stock,
scarcity, free shipping, delivery dates, sales rank, arrival dates, reviews,
verified buyers, discounts, tracking, invoices, payment success, order
placement, and authentication state.

**4 matches, all of them negations** — the help page explaining why no
"in stock" badge, "best sellers", or "new arrivals" exist, and the shipping
page listing which terms are still undecided. No unsupported claim is made
anywhere in the UI.

The demo notices ("Demonstration storefront — no payment is taken", the review
step's "No order is created and no payment is taken") are present, clear, and
concise. They were left as they are.

### Payment credentials — none exist

Verified by enumerating every `<input>` on the payment step by type. The step
contains **only** three radio buttons naming a method (each labelled "…when
payments are connected"), a billing-address checkbox, and the footer
newsletter email field.

**No card number, CVV, expiry, cardholder, UPI ID, IBAN, account number, or
routing field exists anywhere in the flow.**

### Personal data — does not leave memory

A full checkout was completed with uniquely identifiable values, then every
storage surface was searched for them:

| Surface | Result |
|---|---|
| `localStorage` | **No PII** — only `fitnex:cart:v2` and `fitnex:wishlist:v1` |
| `sessionStorage` | **No PII** — empty |
| Cookies | **No PII** — none set |
| Request URLs | **No PII** |
| Request bodies | **No PII** |

**Only the intended cart and wishlist data persists.** The cart holds product
id, size, colour, and quantity — no personal field.

**Third-party hosts contacted, in full:** `fonts.googleapis.com`,
`fonts.gstatic.com`, `res.cloudinary.com`. No analytics, no tracker, no
telemetry.

### Credentials in the build

- **No secret reaches `dist/`.** Zero JWT-like strings; no `service_role`,
  `api_secret`, or live-key pattern.
- The service-role key and Cloudinary API secret that exist in the local
  `.env` appear **nowhere** in the build output. `.env` and `.env.local` are
  gitignored and untracked.
- The only credential in the bundle is the Supabase **publishable**
  (`sb_publishable_…`) key, which is browser-safe by design and governed by
  RLS — exactly as `AGENTS.md` requires.

Supabase was not modified. No authentication, payment processing, analytics,
or new persistence was added.

---

## 8. Metadata and deployment readiness

### Implemented

- **Per-route titles** — all 24 route cases distinct.
- **Per-route descriptions** — one per page, no duplicates.
- **Favicon** — `/favicon.svg`, present and served.
- **Social preview** — `og:site_name`, `og:type`, `og:title`,
  `og:description`, and `twitter:card`/`title`/`description`, built from
  existing copy.
- **Unknown-route behaviour** — the SPA catch-all renders the not-found page.

### Deliberately omitted

**No canonical URL, no `og:url`, and no `og:image`.** This build has no
production domain and no social-preview asset. Inventing either would put a
wrong URL into every share card. Both must be added at launch, by whoever owns
the domain.

### Indexing configuration for the demo

`<meta name="robots" content="noindex, nofollow">` is applied to:

| Route | Why |
|---|---|
| `/cart` | Per-visitor state |
| `/checkout`, `/checkout/payment` | Demonstration only |
| `/orders/:id/confirmation` | Fabricated, session-only snapshot |
| `/account`, `/account/profile`, `/account/addresses`, `/account/orders` | Session-only previews; no auth exists |
| `/collections/<unknown>`, `*` | Not-found states |

Catalog and support pages remain indexable.

**Before a real launch this must change.** If the whole demo is to stay out of
search, add a site-wide `robots.txt` with `Disallow: /` or an origin-level
`X-Robots-Tag` header — per-page `noindex` cannot cover a client-rendered SPA
for crawlers that do not execute JavaScript. If the store goes live for real,
the per-page `noindex` on `/account/*` and `/cart` should stay (they are
correct for a real store too), while `/checkout/*` and the confirmation keep
theirs, and a canonical URL plus `og:image` must be added.

### Required hosting configuration

**SPA deep links need a rewrite.** Every route except `/` is client-side only;
without a rewrite, a direct visit or a refresh on `/collections/...` returns
404 from the static host.

Required rule: **serve `/index.html` for any path that does not match a static
file**, with a 200 status.

| Host | Configuration |
|---|---|
| Netlify | `/* /index.html 200` in `public/_redirects` |
| Vercel | `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` |
| Nginx | `try_files $uri $uri/ /index.html;` |
| Apache | `FallbackResource /index.html` |
| Cloudflare Pages | Automatic for SPAs; otherwise `/* /index.html 200` |

Hashed assets under `/assets/` are immutable and should be served with a long
`Cache-Control`; `index.html` must **not** be cached, or deploys will serve
stale chunk references.

**Nothing was deployed, committed, or pushed in this phase.**

---

## 9. Remaining asset and content issues

| Issue | Status |
|---|---|
| **Promotional text baked into all nine banners** | Mitigated, not solved. Every banner in `banners/` carries a headline, a tagline, and a fake button in its pixels. The real heading and link are HTML on top, and the artwork is `alt=""` + `aria-hidden="true"`, so nothing is announced twice. The scrim reduces the baked words to an unreadable texture. **The real fix is clean, text-free artwork**, which needs separate authorization — none was generated, uploaded, or replaced in this phase. |
| **Banner images are ~2.5× oversized** | Served at 1536×1024 natural, displayed at 600×400, with no responsive variants. ~110–160 kB each. Re-encoding or routing them through Cloudinary would cut the largest remaining image payload. Not done here: it means producing new image files. |
| **Brand "92"** | Not a bug. One product is genuinely branded "92" ("92 Women T-shirt") in the source scrape, so the brand filter shows a numeric option. Left as-is: rewriting source data would be the dishonest fix. |
| **No `og:image`** | No social-preview asset exists. A banner could be reused, but each has baked-in promotional text that would misrepresent a shared link. Needs a purpose-made asset. |
| **Stock is unknown for every product** | Unchanged and correct — the catalog carries no inventory. |

---

## 10. What was not verified

Stated plainly, because an unrun check is not a passed check.

- **No real screen reader was run.** Semantics, labels, landmarks, focus
  order, and live-region wiring were verified structurally and by keyboard.
  NVDA, JAWS, and VoiceOver were not used. Announcement quality is unverified.
- **One engine only.** Chromium. Firefox and Safari/WebKit were not tested,
  and no real mobile device was used — the 360/390/768 results are emulated
  viewports.
- **No Lighthouse or field data.** All metrics are Playwright/CDP lab
  measurements on one machine, median of five runs where stated. No Core Web
  Vitals field data exists for this build.
- **Asset/chunk failure was tested only for images.** Cloudinary blocking was
  verified thoroughly (§6). A failed *route chunk* (a lazy import rejecting
  mid-session) was not simulated; `RouteError` and the error boundary exist
  and render on a thrown route error, but chunk-load failure specifically was
  not forced.
- **Print styles** were not reviewed.
- **No load, soak, or concurrency testing** — not meaningful for a static SPA
  with no backend.
- **The `.dark` theme block is unexercised.** Tokens exist in
  `globals.css` but no toggle ships, so only `:root` was audited. The dark
  values were not contrast-checked.

---

## 11. Backend integration points

The frontend is complete as a demonstration. **A functioning store needs all
of the following, and none of it is frontend work.**

| # | Work | Blocks |
|---|---|---|
| 1 | **Supabase schema + RLS.** The `public` schema is still empty — no tables, no policies. | Everything below |
| 2 | **Authentication.** None exists. The customer pages are session-only previews and say so. | Real accounts, saved addresses, order history |
| 3 | **Move the catalog behind a query.** It is a 392 kB client bundle today. Serving it from Postgres removes it from the initial load. | Real inventory, pricing updates |
| 4 | **Real variant availability.** Size and colour are independent option lists; the source does not say which combinations exist. | Honest add-to-bag, stock display |
| 5 | **Order creation.** No order exists. Checkout produces an in-memory snapshot that a reload discards. | Confirmation, order history, fulfilment |
| 6 | **Payment provider.** None integrated. No payment credential is collected anywhere, and none should be added to this bundle — card data must never touch it. | Taking money |
| 7 | **Commercial and legal policy.** Shipping, returns, privacy, and terms are marked drafts or explicitly unset, because the merchant has set none. | Lawful operation |
| 8 | **Server-side validation.** Zod schemas validate in the browser for UX only. | Trust |
| 9 | **Contact form endpoint.** The form cannot send and says so. | Customer contact |
| 10 | **Prerendering or SSR.** A client-rendered SPA ships no title or content to a crawler that does not execute JavaScript. | SEO, social previews |

---

## 12. Screenshots

All under `docs/screenshots/`, captured from the production preview.

**Desktop (1440×900):**
`phase5-home.png`, `phase5-collection.png`, `phase5-collection-header.png`,
`phase5-collection-header-accessories.png`, `phase5-product.png`,
`phase5-cart.png`, `phase5-help.png`, `phase5-wishlist.png`,
`phase5-notfound.png`

**Mobile (390×844, full page):**
`phase5-home-390.png`, `phase5-collection-390.png`, `phase5-product-390.png`,
`phase5-cart-390.png`

Earlier phases' screenshots (`phase2-*`, `phase3-*`, `phase4-*`) are retained.

---

## 13. Final verification

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | **Clean** — 0 errors, 0 warnings |
| Tests | `npm test` | **234 passed** (229 baseline + 5 added) |
| Build | `npm run build` | **Succeeds** |
| axe-core | 48 route×viewport runs | **0 violations** |
| Route audit | 96 combinations | 0 overflow, 0 console errors, 0 page errors |
| Journey | end-to-end | **18/18 passed** |
| Checkout + privacy | end-to-end | **18/18 passed** |
| Keyboard / focus / zoom | manual harness | **14/14 passed** |
| Gallery / variants / wishlist | manual harness | **9/9 passed** |
| Links | all routes | 53 internal, **0 broken** |

### Tests added

Five, in `src/lib/page-title.test.js`, covering the title-composition rule
that was actually broken before this phase — the suffix rule, the no-title
fallback, blank and whitespace-only titles, trimming, and that distinct routes
produce distinct titles.

Deliberately **no** tests were added that merely restate implementation
details. Whether React hoists metadata into `<head>` is React's behaviour, not
this project's, and the suite runs in Node with no DOM; that was verified in
the browser instead and recorded in §5.2.

---

## 14. Is the frontend demo complete?

**Yes, as a frontend demonstration.** Every registered route renders, every
link resolves, the catalog browses and filters correctly, the cart and
wishlist persist, the demo checkout runs end to end, accessibility is clean
under automated audit and manual keyboard testing, there is no horizontal
overflow at any tested width or at 200% zoom, no console error on any route,
no unsupported claim in the UI, no personal data in storage, and no secret in
the build.

**No, as a production store** — and the gap is not frontend work. Nothing here
takes a payment, creates an order, knows who a customer is, or knows whether
anything is in stock. §11 lists what that needs.

The honest one-line summary: **this is a complete, accessible, and truthful
storefront frontend wired to a catalog, with every commercial function
deliberately absent and labelled as absent.**
