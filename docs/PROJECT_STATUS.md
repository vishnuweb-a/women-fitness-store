# Project Status

**Last updated:** 2026-10-02
**Current phase:** Phase 0 — project initialization (complete)
**Next phase:** Phase 1 — landing page and shared storefront navigation

Keep this file current. It is the first thing an agent reads to learn what
actually exists.

## Phase 0 — complete

### Delivered

| Area | State |
|---|---|
| Vite + React 19 (JavaScript/JSX) | Working |
| Tailwind CSS v4 via `@tailwindcss/vite` | Working, CSS-first config, no JS config file |
| Design tokens | Defined in `src/styles/globals.css` |
| shadcn/ui, JavaScript mode | Configured; Button, Input, Label, Card, Sheet, Select, Skeleton added |
| `@/` alias | Working in `vite.config.js` and `jsconfig.json` |
| React Router 7 | All 11 routes registered and rendering |
| TanStack Query provider | Mounted, configured defaults |
| Shared layout | Header (with mobile nav sheet), `<main>`, footer, skip link |
| Loading / error / empty / not-found | Implemented in `src/components/shared/` |
| Error boundary | Application-level, plus router `errorElement` |
| Supabase client | Centralised, publishable key only |
| Cloudinary URL builder | Implemented, dependency-free |
| ESLint 9 flat config | Clean, with `jsx-a11y` |
| Documentation | README, AGENTS.md, CLAUDE.md, and five docs files |

### Verified by running

| Check | Command | Result |
|---|---|---|
| Dependency install | `npm install` | Succeeded, 0 vulnerabilities |
| Lint | `npm run lint` | Clean — 0 errors, 0 warnings |
| Production build | `npm run build` | Succeeded — 2069 modules, ~347ms, 428 kB JS (135 kB gzip), 66 kB CSS (12.6 kB gzip) |
| Dev server | `npm run dev` | Started, no startup errors |
| Route rendering | Headless Chromium against the dev server | All 11 routes rendered the expected `h1`, with header/main/footer landmarks present, and **zero console errors** |
| Skip link | Keyboard Tab from page load | First focusable element is "Skip to main content" |
| Secret leakage | Scan of `dist/` against the secret-bearing values in `.env` | **No** service-role key, Cloudinary API key, or API secret in the bundle. Only the publishable key, which is intended to be public. |
| Banner asset serving | HTTP request to `/assets/banners/banner1.png` | 200, correct size |

The route check used a temporary Playwright script, run once and removed; it
is not part of the repository and there is no test suite yet.

### Verified read-only against Supabase

Via the authenticated MCP connection, on 2026-10-02:

- Project `nnbxsmefuoaekbcdosea` is reachable; its API URL matches the local
  configuration.
- `public` schema: **zero tables**. The database is empty.
- Publishable key and legacy anon key both exist and are enabled.

Nothing was created, altered, or migrated.

### Cloudinary status

- **Verified:** cloud name is configured; the URL builder is implemented and
  compiles into the build.
- **Not verified:** no Cloudinary asset has been fetched, because nothing has
  been uploaded to the account yet. The shell uses local banner files.
- Uploads are intentionally unimplemented — see `docs/PROJECT_SETUP.md`.

## Known limitations

- **Checkout and payment are not operational.** They are placeholder routes.
  No payment provider is integrated; no card or UPI data is collected.
- **No authentication.** `/account` is a placeholder.
- **No database schema.** No tables, no RLS policies, no seed data.
- **No cart state.** `/cart` renders an empty state only; the client-state
  approach has not been chosen.
- **No product data.** `src/services/` and `src/data/` are empty directories.
- **No tests.** No test runner is installed. The reactjs skill recommends
  Vitest + React Testing Library when tests begin.
- **Webfonts not loaded.** `--font-sans` (Inter) and `--font-display`
  (Archivo) currently fall back to the system stack.
- **Banner PNGs are large** (~1.8–2.2 MB each) and are served uncompressed.
  Compress or route through Cloudinary before launch.
- **Dark mode is defined but has no toggle.** The `.dark` class variant and
  tokens exist; no UI control sets it.
- **ESLint is pinned to 9.x** because `eslint-plugin-jsx-a11y` does not yet
  support ESLint 10.
- **`tailwind-4-docs` skill snapshot is not initialised** and requires a
  network sync plus licence acceptance.

## Next phase — Phase 1: landing page and shared storefront navigation

Planned scope:

1. Build the full home page from `pages/women1.png` (screen 01): hero,
   category tiles, featured products, flash-sale and new-arrivals promos,
   best sellers, testimonials, and the newsletter strip.
2. Complete the shared navigation: working search entry point, cart and
   wishlist badge counts, and the full category menu.
3. Introduce the product card component and the compact product grid.
4. Add placeholder/seed product data in `src/data/` so the grid renders before
   the database exists.
5. Load the display and body webfonts.
6. Optimise banner delivery.

Before starting, read `AGENTS.md`, this file, `docs/DESIGN_SYSTEM.md`, and the
skills flagged for screen work in `docs/SKILLS_INDEX.md` — in particular
`image-to-code`, `frontend-a11y`, `ui-ux-pro-max`, and
`tailwindcss-fundamentals-v4`.
