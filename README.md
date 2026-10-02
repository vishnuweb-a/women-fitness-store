# FITNEX WOMEN

E-commerce storefront for women's sports and fitness accessories.
*Stronger Every Day.*

A React single-page application built with Vite, Tailwind CSS v4, and
shadcn/ui, with Supabase as the intended data layer.

> **Status: Phase 4 complete — customer pages, wishlist polish, and support
> pages.** The home page, search, a fully filterable collection listing,
> product detail with a keyboard-accessible gallery, and a persistent
> browser-local cart and wishlist all work against a real 44-product catalog
> with imagery delivered by Cloudinary. Filters, sorting, and pagination live
> in the URL, so a listing is shareable and back/forward behave. Checkout,
> billing, payment-method selection, and confirmation are built — but **as a
> frontend demonstration only: no payment is taken, no order is created, and
> no payment credential is collected anywhere.** The customer hub, profile and
> address previews, demo order list, and the help and policy pages are built
> too — **without authentication**, which does not exist in this build: the
> previews are held in memory for one session and cleared on reload. Stock is
> unknown for every product, and there is still no database schema. See
> [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) and
> [docs/CUSTOMER_PAGES.md](docs/CUSTOMER_PAGES.md).

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the public values
npm run dev
```

Open the URL Vite prints (http://localhost:5173 by default).

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (catalog normalisation and cart identity) |

Requires Node.js 20.19+ and npm. **npm is the package manager** — do not add a
second lockfile.

## Environment variables

Only `VITE_`-prefixed variables reach the browser, and **everything with that
prefix is public** — it ships inside the JavaScript bundle.

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key — browser-safe; Row Level Security governs access |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud name for building public image delivery URLs |

**Never** put a Supabase service-role key or a Cloudinary API key/secret in a
`VITE_` variable or anywhere in `src/`.

The repository's pre-existing `.env` uses different, unprefixed names and was
left unchanged; the mapping is documented in
[docs/PROJECT_SETUP.md](docs/PROJECT_SETUP.md).

## Assets

| Location | Contents |
|---|---|
| `banners/` | Nine original promotional PNGs. **Preserve — never edit.** |
| `public/assets/banners/` | Runtime copies, served at `/assets/banners/*.png` |
| `pages/` | Eight storefront screen references across three PNGs. Reference only — not route components. |

## Routes

| Path | Page | State |
|---|---|---|
| `/` | Home | Implemented — full landing page |
| `/collections` | Collections index | Implemented — tiles plus a filterable listing |
| `/collections/:slug` | Category listing | Implemented — filters, sorting, pagination in the URL |
| `/products/:slug` | Product detail | Implemented — gallery, options, add to bag |
| `/cart` | Shopping bag | Implemented — lines, quantities, merchandise subtotal |
| `/checkout` | Delivery information | **Demonstration** — form works; takes no payment |
| `/checkout/payment` | Billing, payment method, review | **Demonstration** — no provider, no credential fields |
| `/orders/:id/confirmation` | Demo completion | **Demonstration** — in-memory snapshot; no order exists |
| `/account` | Customer hub | Implemented — no auth exists, so no identity or membership is shown |
| `/account/profile` | Profile preview | Implemented — session only, cleared on reload |
| `/account/addresses` | Address preview | Implemented — session only, exactly one default |
| `/account/orders` | Demo orders | Implemented — reads the in-memory demo checkout snapshots |
| `/wishlist` | Wishlist | Implemented — browser-local saved products |
| `/help` | Help centre | Implemented — describes implemented behaviour only |
| `/contact` | Contact | Implemented — no endpoint; the form cannot send and says so |
| `/shipping` | Shipping | Implemented — states that no policy has been set |
| `/returns` | Returns | Implemented — states that no policy has been set |
| `/privacy` | Privacy | Implemented — a marked draft of observed behaviour |
| `/terms` | Terms | Implemented — a marked draft |
| anything else | Not found | Working |

## Integration status

**Supabase** — connection verified read-only on 2026-10-02. The project is
reachable and its URL matches the local configuration. The `public` schema is
**empty**: no tables, no RLS policies, no seed data. The browser client uses
the publishable key only.

**Cloudinary** — the cloud name is configured and the delivery-URL builder is
implemented, but no asset has been fetched because nothing has been uploaded
yet. The shell uses local banner files. Uploads are deliberately not
implemented: signing requires the API secret, which must stay server-side.

## Documentation

| File | Contents |
|---|---|
| [AGENTS.md](AGENTS.md) | Conventions and rules for anyone working here — **the main instruction source** |
| [CLAUDE.md](CLAUDE.md) | Claude-specific entry point |
| [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) | What exists, what was verified, what is pending |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, directory layout, routing, state, boundaries |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Tokens, reference assets, visual conventions |
| [docs/PROJECT_SETUP.md](docs/PROJECT_SETUP.md) | Install, environment, Supabase and Cloudinary detail |
| [docs/CATALOG.md](docs/CATALOG.md) | Product data provenance, price units, Cloudinary pipeline |
| [docs/SKILLS_INDEX.md](docs/SKILLS_INDEX.md) | The 17 skills in `.agents/skills/`, with caveats |

## The catalog

**44 products across 3 categories**, with 405 unique images. Data comes from a
public marketplace scrape; `src/services/catalog.js` normalises it without
rewriting it. Images are delivered by Cloudinary (406/406 uploaded) with the
local files kept as a development fallback.

Provenance, the price-unit decision, and the upload pipeline:
[docs/CATALOG.md](docs/CATALOG.md).

### What this storefront does not claim

The catalog carries no inventory, no sales rank, no dates, and no FITNEX
reviews — so the UI asserts none of those. Stock is shown as unknown, size and
colour are presented as independent option lists, scraped ratings are labelled
as marketplace listing ratings, curated sections use neutral titles rather than
"Best Sellers", and newsletter sign-up says plainly that it is not connected.

## What Phase 1 completed

The landing page built from the reference screen, shared header and footer with
working search, desktop and mobile navigation, reusable product and category
components, Cloudinary image delivery, collection and product routes, and a
persistent browser-local cart and wishlist.

## What Phase 2 completed

The full collection experience — breadcrumbs, category banner, result count, a
desktop filter rail and a mobile filter Sheet, sorting, a responsive grid,
pagination, and an empty state — with filters, sorting, and pagination all held
in URL search parameters. The complete product page, including a thumbnail
gallery with a roving-tabindex keyboard contract and an accessible enlargement
Dialog, specifications, required option selection, quantity, wishlist, and
related products. The complete cart, with variant-aware line identity,
move-to-wishlist, a merchandise subtotal, and recovery from corrupt or stale
stored data including migration of Phase 1 carts. Route-level code splitting, a
shipped image fallback that works in production, and a favicon.

Lint, **83 tests**, the production build, and a **48-check browser suite** at
1440 / 768 / 390 px were all run and passed, with no console errors and no
credential in the build output.

Filters only exist where the catalog supports them. There is no stock,
discount, rating, or "new in" filter, no sales-rank sorting, no reviews, no
delivery promise, and no grand total — because the source data supports none of
those, and inventing them would be the easiest way to make this storefront
dishonest.

## What comes next

**Phase 5: final frontend polish and end-to-end QA** — one sweep across every
route rather than one feature, then a full keyboard, screen-reader, and
end-to-end run.

After that, the backend work that still blocks an honest checkout: **a
Supabase schema with RLS, authentication, real variant availability, and
moving the catalog behind a query.** Details in
[docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
