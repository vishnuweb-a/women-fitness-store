# Project Setup

## Requirements

Node.js 20.19+ (developed on 24.18.0) and npm (developed on 11.16.0).
**npm is the package manager** — `package-lock.json` is committed. Do not
introduce a second lockfile.

## Install and run

```bash
npm install
cp .env.example .env.local   # then fill in the public values
npm run dev                  # http://localhost:5173
```

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built output locally |
| `npm run lint` | ESLint across the repo |

## Environment variables

Vite only exposes variables prefixed `VITE_`. **Everything with that prefix is
embedded in the JavaScript bundle and is readable by any visitor.** Treat the
prefix as a declaration that a value is public.

Required public variables (placeholders in `.env.example`):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key — safe for the browser; RLS governs access |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud name for building public delivery URLs |

Read them only through [`src/lib/env.js`](../src/lib/env.js), never via
`import.meta.env` scattered across components.

### Mapping from the pre-existing `.env`

The repository already contained a `.env` written before this application
existed. **It was left byte-for-byte unchanged.** Its names are unprefixed (and
one is misspelled), so they are invisible to Vite. A `.env.local` was generated
alongside it with the public subset renamed:

| Name in the original `.env` | Name the app reads | Public? |
|---|---|---|
| `SUPABASE_URL` | `VITE_SUPABASE_URL` | Yes |
| `SUPABASE_PUBLISAHABLE_KEY` *(sic — typo is in the source file)* | `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes |
| `cloud name` | `VITE_CLOUDINARY_CLOUD_NAME` | Yes |
| `ANON_KEY` | — unused; the publishable key supersedes it | Yes |
| `SUPABASE_SERVICE_ROLE_KEY`, `SERVICE_ROLE_KEY` | **never exposed** | **No — secret** |
| `api key`, `api secret`, `CLOUDINARY_URL` | **never exposed** | **No — secret** |

Both `.env` and `.env.local` are git-ignored; only `.env.example` is committed.

If you rotate credentials, update `.env.local` (and the original `.env` if you
still rely on it elsewhere). Changing the typo'd name in `.env` is safe from
this app's perspective — nothing in `src/` reads it.

## Supabase

**Verified** on 2026-10-02 via the authenticated Supabase MCP connection,
read-only:

- Project `nnbxsmefuoaekbcdosea` is reachable; its API URL matches the
  `SUPABASE_URL` in the local `.env`.
- The `public` schema contains **zero tables**. The database is empty.
- The project exposes both a modern publishable key (`sb_publishable_…`) and a
  legacy anon JWT; both are enabled. The value in `.env` is the modern
  publishable key, which is what the app uses.

No tables were created, no policies changed, no migrations run, and no data
modified — as required for this phase.

**Pending** (not yet done): schema design, Row Level Security policies, auth
configuration, and seed data. RLS must be enabled on every table before the
frontend reads from it; the publishable key is only as safe as the policies
behind it. Read
[`.agents/skills/supabase-postgres-best-practices/SKILL.md`](../.agents/skills/supabase-postgres-best-practices/SKILL.md)
before writing any schema.

Client: [`src/lib/supabase.js`](../src/lib/supabase.js). It exports `null` when
unconfigured so the shell still boots; guard with `isSupabaseConfigured` or
call `requireSupabase()`.

## Cloudinary

**Verified on 2026-10-02:** all **406** product images were uploaded to the
configured account and all **405** catalog image references resolve through the
delivery manifest. Three representative transformed URLs were fetched and
returned HTTP 200 (`image/jpeg`, 15–41 kB each). Delivery is live.

### Credentials

The upload script resolves credentials from the pre-existing `.env`, whose keys
are irregular (`cloud name`, `api key `, `api secret`, and a line reading
`cloudnary url  : CLOUDINARY_URL=...`). `scripts/lib/cloudinary-credentials.js`
parses them tolerantly — lowercasing keys and stripping spaces, underscores and
colons — and also accepts `CLOUDINARY_URL` or the standard
`CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
environment variables. It reports which values resolved **without printing any
of them**.

Only the **cloud name** is public, exposed to the browser as
`VITE_CLOUDINARY_CLOUD_NAME`. The API key and secret are read by the Node
script alone and verified absent from `dist/`.

### Running an upload

```bash
node scripts/upload-products-to-cloudinary.mjs             # upload
node scripts/upload-products-to-cloudinary.mjs --dry-run   # plan only
node scripts/upload-products-to-cloudinary.mjs --limit 20  # first N files
```

The script walks `public/assets/products/**`, uploads each unique file once
into the `fitnex-women/products` namespace, and writes
`src/data/cloudinary-manifest.json`.

| Safeguard | Implementation |
|---|---|
| Idempotent | Deterministic public ID: slugified path + 8-char hash of the path |
| No overwriting | `overwrite=false` — an existing remote asset is returned, never replaced |
| No deletion | The script has no delete path |
| Resumable | `.cloudinary-upload-checkpoint.json` (git-ignored); a re-run skips successes and retries only failures |
| Bounded load | Concurrency 6; up to 4 attempts with exponential backoff; permanent 4xx not retried |
| Accurate failures | Each failure is recorded with its error and whether it is permanent |

It is a plain Node script using `node:crypto` and `fetch`. **The server-side
`cloudinary` SDK is deliberately not installed**, so no credentialed dependency
can be pulled into the browser bundle. Nothing in `src/` may import from
`scripts/`.

### Delivery

[`src/lib/cloudinary.js`](../src/lib/cloudinary.js) builds delivery URLs from
the public cloud name, with `f_auto,q_auto` defaults and a `srcset` helper.
[`src/lib/product-images.js`](../src/lib/product-images.js) resolves catalog
images through the manifest and **falls back to the local
`/assets/products/...` path** when an image is absent from it, so development
works with or without Cloudinary.

Catalog transforms add `c_pad,b_white` — padding, not cropping, so a racquet or
a cricket bat is never cut off — across `srcset` widths 240/360/480/720/960.

### Browser uploads

Still not implemented, and still should not be: signing needs the API secret.
If user uploads are ever required, sign them in a Supabase Edge Function, or
use a tightly restricted unsigned preset (fixed folder, allow-listed formats,
size cap). No such preset has been verified for this account.

## Assets

| Location | Contents | Rule |
|---|---|---|
| `banners/` | 9 original promotional PNGs | Preserve. Never edit or delete. |
| `public/assets/banners/` | Optimised WebP served at `/assets/banners/*.webp` | Regenerate with `python scripts/optimise-banners.py` |
| `public/assets/products/` | 406 scraped product images | **Git-ignored.** Dev fallback only; production uses Cloudinary |
| `pages/` | 8 screen references across 3 PNGs | Reference only; never imported by the app |

Banner optimisation (`scripts/optimise-banners.py`, needs Pillow) caps the long
edge at 2000 px and encodes WebP at quality 82: **17.4 MB → 1.04 MB**. The
originals in `banners/` are read, never written.

### Production build size

`public/` is copied verbatim into `dist/`, which would add ~66 MB of product
JPEGs that production never requests. A Vite plugin in `vite.config.js` removes
`dist/assets/products` after the build, bringing `dist/` to **2.1 MB**.

To ship the local images instead — if Cloudinary delivery is ever disabled —
set `VITE_SHIP_LOCAL_PRODUCT_IMAGES=true` and accept roughly 66 MB of extra
build output.

## Verification performed

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for the commands run and results.
