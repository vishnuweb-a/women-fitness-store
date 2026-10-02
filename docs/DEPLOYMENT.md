# Deploying to Vercel (production)

The app is a static Vite + React SPA. There is no server component: the build
produces `dist/`, Vercel serves it from its CDN, and the browser talks directly
to Supabase and Cloudinary.

## 1. Required environment variables

Set all three in **Vercel → Project → Settings → Environment Variables**, for the
`Production` environment (add `Preview` too if you want working preview deploys).

| Variable | Value | Why it is required |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Supabase client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Supabase client |
| `VITE_CLOUDINARY_CLOUD_NAME` | your cloud name | **All product imagery** |

Copy the values from your local `.env.local` (it is gitignored and is *not*
uploaded by `vercel deploy`, so the dashboard is the only source in production).

Only `VITE_`-prefixed, browser-safe values belong here. The Supabase
service-role key and the Cloudinary API key/secret must never be added — every
`VITE_` variable is embedded in the public JavaScript bundle.

### `VITE_CLOUDINARY_CLOUD_NAME` is not optional in production

`vite.config.js` deletes `dist/assets/products` from the build on purpose
(~66 MB of scraped JPEGs). Production resolves every catalog image through the
Cloudinary manifest instead. If the cloud name is missing,
`resolveProductImage()` falls back to the local path — which is not deployed —
so **every product image 404s**. The startup env warning is suppressed when
`import.meta.env.PROD` is true, so this fails silently. Set the variable.

If you ever need to ship the local images instead, set
`VITE_SHIP_LOCAL_PRODUCT_IMAGES=true` and accept the bundle size.

Environment variables are read at **build** time, not run time: after changing
one you must redeploy for it to take effect.

## 2. Deploy

Vercel reads `vercel.json` at the repo root — framework `vite`, build
`npm run build`, output `dist`, install `npm ci`.

**Git integration (recommended):** import the repo in Vercel and set the root
directory to this project's folder. Pushes to `main` deploy to production.

**CLI:**

```bash
npm i -g vercel
vercel login
vercel link
vercel --prod
```

## 3. What `vercel.json` configures

- **SPA rewrites** — the app uses `createBrowserRouter`, so deep links like
  `/cart` are real URLs with no file behind them. Everything except `/assets/*`
  and `/favicon.svg` rewrites to `/index.html` and React Router takes over.
  Without this, a refresh on any route but `/` returns 404.
- **Caching** — hashed files in `/assets/*` are immutable for a year;
  `index.html` is revalidated every request so a new deploy is picked up at once.
- **Security headers** — `nosniff`, `DENY` framing, a strict referrer policy,
  and camera/microphone/geolocation disabled.

## 4. Verify after deploying

1. Load `/` — the homepage renders.
2. Navigate to a product, then **hard-refresh** — confirms the SPA rewrite.
3. Confirm product images load from `res.cloudinary.com` (DevTools → Network),
   not from a 404ing `/assets/products/...` path.
4. Check the console for Supabase configuration errors.
