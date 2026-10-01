# FITNEX WOMEN

E-commerce storefront for women's sports and fitness accessories.
*Stronger Every Day.*

A React single-page application built with Vite, Tailwind CSS v4, and
shadcn/ui, with Supabase as the intended data layer.

> **Status: Phase 2 complete — collections, product detail, and the cart.**
> The home page, search, a fully filterable collection listing, product detail
> with a keyboard-accessible gallery, and a persistent browser-local cart and
> wishlist all work against a real 44-product catalog with imagery delivered by
> Cloudinary. Filters, sorting, and pagination live in the URL, so a listing is
> shareable and back/forward behave. **Checkout and payment are not
> operational**, stock is unknown for every product, and there is no
> authentication or database schema. See
> [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).

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
| `/` | Home | Hero built; sections pending |
| `/collections` | Collections index | Placeholder |
| `/collections/:slug` | Category listing | Placeholder |
| `/products/:slug` | Product detail | Placeholder |
| `/cart` | Shopping bag | Empty state |
| `/checkout` | Delivery information | Placeholder — **not operational** |
| `/checkout/payment` | Billing and payment | Placeholder — **not operational** |
| `/orders/:id/confirmation` | Order confirmation | Placeholder |
| `/account` | Account | Placeholder — no auth |
| `/wishlist` | Wishlist | Empty state |
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

**Phase 3: a Supabase schema with RLS, real variant availability, and moving
the catalog behind a query** — the prerequisites for an honest checkout.
Details in [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
