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

**Verified**: the cloud name is present in the local configuration and the URL
builder is implemented and exercised by the build.
**Not verified**: no asset has been fetched from Cloudinary — nothing has been
uploaded to it yet, so there is nothing to request. The storefront shell uses
the local banner files instead.

[`src/lib/cloudinary.js`](../src/lib/cloudinary.js) builds delivery URLs from
the public cloud name and an asset public ID, with `f_auto,q_auto` defaults and
a `srcset` helper. It has no dependencies by design.

**Uploads are deliberately not implemented.** Signing an upload needs the API
secret, which cannot be given to a browser. When uploads are needed, either:

1. **Preferred** — add a Supabase Edge Function that signs the upload
   server-side and returns the signature to the client. The secret stays on
   the server.
2. Or use an unsigned upload preset, *only* if it is tightly restricted:
   fixed folder, allow-listed formats, size cap, and rate limiting. No such
   preset has been verified to exist for this account.

Do not install the server-side `cloudinary` SDK into this React app.

## Assets

| Location | Contents | Rule |
|---|---|---|
| `banners/` | 9 original promotional PNGs | Preserve. Never edit or delete. |
| `public/assets/banners/` | Copies served at `/assets/banners/*.png` | Safe to regenerate from `banners/` |
| `pages/` | 8 screen references across 3 PNGs | Reference only; never imported by the app |

The banner PNGs are large (~1.8–2.2 MB each). Before the storefront ships,
compress them or serve them through Cloudinary with `f_auto,q_auto` and a
responsive `srcset` — `buildCloudinarySrcSet()` already exists for this.

## Verification performed

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for the commands run and results.
