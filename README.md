# FITNEX WOMEN

E-commerce storefront for women's sports and fitness accessories.
*Stronger Every Day.*

A React single-page application built with Vite, Tailwind CSS v4, and
shadcn/ui, with Supabase as the intended data layer.

> **Status: Phase 0 — project foundation.** This is a runnable shell with
> routing, layout, and design tokens in place. The storefront screens are not
> built yet, and **checkout and payment are not operational.** See
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
| [docs/SKILLS_INDEX.md](docs/SKILLS_INDEX.md) | The 17 skills in `.agents/skills/`, with caveats |

## What Phase 0 completed

Project scaffolding, the full dependency stack, Tailwind v4 tokens, shadcn/ui
in JavaScript mode, the `@/` alias, routing for all 11 routes, shared layout
with accessible landmarks and a skip link, loading/error/empty/not-found
components, an error boundary, the Supabase and Cloudinary client boundaries,
ESLint, and the documentation set. Lint, build, and browser route rendering
were all run and passed.

## What comes next

**Phase 1: the landing page and shared storefront navigation** — building the
home screen from the reference, completing the header and footer, and
introducing the product card and grid. Details in
[docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
