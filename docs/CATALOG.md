# Catalog and Image Provenance

How product data and imagery reach the storefront, and what in them is
verified versus provisional.

## Source

Product data was produced by a Myntra scraper whose checkpoint JSON files were
flattened into [`src/data/products.js`](../src/data/products.js). That file is
**generated — do not edit it by hand**, and do not regenerate it from scratch:
it already carries a manual deduplication (see below).

Verified against the current file on 2026-10-02:

| Fact | Value |
|---|---|
| Products | **44** (44 unique IDs, 44 unique slugs) |
| Categories | **3** |
| Image references | **407** across all galleries |
| Unique image files referenced | **405** |
| Image files on disk | **406** (one file is not referenced by any product) |
| Products with a single image | **9** |
| Products with a discount | **0** — every `discountPercentage` is 0 and `originalPrice === price` |
| Price range | ₹199 – ₹12,499 |
| Brands | 17 |

Two gallery entries reuse a file that another gallery also references, which
is why 407 references resolve to 405 unique files.

### Category counts

| Slug (canonical) | Friendly label | Products |
|---|---|---|
| `women-sportswear-clothing` | Sportswear | 15 |
| `women-sports-equipments` | Equipment | 15 |
| `women-sports-accessories` | Accessories | 14 |

The three slugs above are canonical and are the only categories the storefront
offers. Narrower groupings from the reference screens — "Yoga & Pilates",
"Hydration", "Recovery", "New Arrivals", "Sale" — are **not** created: no field
in the source supports them reliably, and the links would lead to empty
collections.

### Deduplication

The scrape contained the HRX ankle-socks product **twice** under ID
`31105932`. The duplicate was removed before `products.js` was generated. A
regression test asserts that exactly one product carries that ID, so a future
regeneration cannot silently reintroduce it.

## Normalisation layer

Components never import `src/data/products.js` directly. They go through
[`src/services/catalog.js`](../src/services/catalog.js), which adapts the
generated data without replacing it. The normalised product shape:

| Field | Notes |
|---|---|
| `id`, `slug` | Stable identifiers, straight from the source |
| `categorySlug`, `categoryLabel`, `productType` | `clothing` \| `equipment` \| `accessory` |
| `name`, `description`, `brand` | Whitespace collapsed; **no word is rewritten** |
| `currency`, `pricePaise` | Integer paise |
| `compareAtPaise` | `null` unless the source original price is genuinely higher |
| `images[]`, `primaryImage`, `hasSingleImage` | Ordered front → model → side → back → detail |
| `sizes[]`, `colors[]` | **Independent option lists** |
| `sourceRating` | Marketplace rating — *not* a FITNEX review |
| `availability` | Always `'unknown'` |
| `provenance` | `{ source: 'myntra-scraper-checkpoint', sourceId }` |

### Price units — verified before converting

The source `price` is a **whole-rupee integer**. Every one of the 44 values is
an integer in the range 199–12499 with no decimal component, which is
consistent with rupees and not with paise (₹1.99–₹124.99 would be implausible
for this catalog). It is therefore multiplied by 100 **exactly once** to reach
paise. A test asserts `pricePaise === source.price * 100` for all 44 products,
so a double conversion would fail the suite.

### Things the storefront deliberately does not claim

These are correctness constraints, not style preferences, and each is covered
by a test:

- **Stock is unknown.** The source has no inventory data. No "In stock" badge
  is rendered anywhere, and the local cart explicitly says it reserves nothing.
- **Size and colour are independent lists.** The source lists them separately;
  it does not say which combinations exist. The product page states this in
  plain language rather than implying a valid variant matrix.
- **Scraped ratings are not FITNEX reviews.** They are exposed only as
  `sourceRating`, rendered with an explicit note that they come from the
  original marketplace listing. FITNEX has collected no reviews, so no review
  text, star summary, or customer identity is shown — none would be real.
- **No "Best Sellers" or "New Arrivals".** There is no sales rank and no date
  field. Curated sections use neutral titles ("Featured products", "More to
  explore") that the data supports.

## Querying the catalog (Phase 2)

Filtering, sorting, and pagination live in
[`src/services/catalog-query.js`](../src/services/catalog-query.js), kept pure
so the listing contract is testable without rendering. The constraints above
decide what it may offer:

| Offered | Backed by |
|---|---|
| Category filter | `categorySlug` — one of the three canonical slugs |
| Brand filter | `brand` (17 distinct values) |
| Price filter | `pricePaise`, bucketed into five brackets over the real 199–12,499 range |
| Listed-size filter | `sizes[]` |
| Listed-colour filter | `colors[]` |
| Sort: price asc/desc, name A-Z/Z-A | `pricePaise`, `name` |
| Sort: "Featured" | Catalog order — **not** a sales rank, and labelled neutrally |

**Not offered, because nothing supports it:** availability or in-stock filters,
rating thresholds, discount or "on sale" filters, "new in" or arrival-date
sorting, and best-selling or popularity sorting.

The size and colour filters match products that *list* an option. Because the
source gives sizes and colours as independent lists, this is not an
availability claim, and the filter rail says so beneath both groups.

Every sort ends in a slug tiebreak, so the order is total: equal prices or
equal names never leave the sequence to the engine's sort stability, and a
reload reproduces the same page exactly.

Every URL parameter is normalised on read. An unknown category, brand, bracket,
size, colour, or sort key is dropped; a non-numeric, zero, negative, or
fractional page falls back to 1; an out-of-range page is clamped to the last
real page and the URL corrected with a `replace`. A hand-edited URL therefore
cannot produce a broken listing.

## Image delivery

### Cloudinary

All **406** files under `public/assets/products/` were uploaded to Cloudinary
on 2026-10-02 by
[`scripts/upload-products-to-cloudinary.mjs`](../scripts/upload-products-to-cloudinary.mjs).

| Metric | Result |
|---|---|
| Uploaded | **406** |
| Skipped (already present) | 0 (first run) |
| Failed | **0** |
| Namespace | `fitnex-women/products` |
| Catalog references resolved by the manifest | **405 / 405** |

The script is server-side only. It reads the API secret, so it must never be
imported from `src/`. The server-side `cloudinary` SDK is deliberately **not**
installed: signing uses `node:crypto` and uploading uses `fetch`, so nothing
Cloudinary-credentialed can reach the browser bundle.

Its safeguards:

- **Deterministic public IDs** — slugified relative path plus an 8-character
  hash of that path, so re-running is idempotent and two similarly named
  directories cannot collide.
- **`overwrite=false`** — an existing remote asset is never replaced.
- **No deletes.** The script has no delete path at all.
- **Resumable checkpoint** at `.cloudinary-upload-checkpoint.json` (git-ignored,
  private) — a re-run skips what already succeeded and retries only failures.
- **Bounded concurrency** (6) with exponential backoff and up to 4 attempts;
  permanent 4xx responses are not retried.

Re-run it with `node scripts/upload-products-to-cloudinary.mjs`. Use
`--dry-run` to see the plan, `--limit N` to upload a subset.

### Delivery manifest

[`src/data/cloudinary-manifest.json`](../src/data/cloudinary-manifest.json) is
**public, safe metadata only** — relative source path, public ID, secure URL,
dimensions, and format. It contains no credential.

[`src/lib/product-images.js`](../src/lib/product-images.js) resolves each
catalog image through the manifest. Transforms are
`f_auto,q_auto` (automatic format and quality) plus `c_pad,b_white` for catalog
imagery — padding rather than cropping, because a badminton racquet or a
cricket bat must not be cut off to fit an apparel-shaped tile. Responsive
`srcset` widths are 240/360/480/720/960.

Verified by fetching three representative transformed URLs: all returned HTTP
200 with `content-type: image/jpeg`, at 15–41 kB each versus ~200 kB–1 MB for
the originals.

### Local fallback and the production build

The 406 source JPEGs total **~66 MB**. `public/` is copied verbatim into
`dist/`, which would bloat the production output with files production never
requests. A small Vite plugin in
[`vite.config.js`](../vite.config.js) removes `dist/assets/products` after the
build. The files stay on disk and the dev server still serves them, so local
development works with or without Cloudinary.

If Cloudinary delivery is ever disabled, set
`VITE_SHIP_LOCAL_PRODUCT_IMAGES=true` to ship the local fallback instead and
accept roughly 66 MB of additional build output.

### The fallback chain (corrected in Phase 2)

Phase 1 fell back from a failed Cloudinary URL to the local
`/assets/products/...` path. **That path does not exist in production** — the
plugin above removes it — so the fallback was guaranteed to 404, and the second
failure re-entered the same error handler.

`components/shared/product-image.jsx` now walks a finite chain, each stage
firing at most once:

1. the Cloudinary delivery URL;
2. **in development only**, the local file (the dev server does serve it, which
   is useful when Cloudinary is unconfigured or offline);
3. `/assets/product-placeholder.svg` — a neutral mark that lives outside
   `assets/products/` and so genuinely ships in `dist/`;
4. a CSS-only box, which issues no request and cannot fail in turn.

The placeholder stage carries no `onError` handler, so the chain cannot loop.
Its `alt` text names the product and states that the image is unavailable,
rather than letting a placeholder silently stand in for the product.

Verified by aborting every `res.cloudinary.com` request in a headless browser
against the production preview: the placeholder rendered and **0 images were
broken**.

## Version control

| Path | Tracked? | Why |
|---|---|---|
| `src/data/products.js` | **Yes** | The catalog itself |
| `src/data/cloudinary-manifest.json` | **Yes** | Public, safe metadata; the build needs it |
| `public/assets/products/**` | No | ~66 MB of binaries, served from Cloudinary |
| `.cloudinary-upload-checkpoint.json` | No | Private upload state, not a deliverable |

`src/data/` as a whole is **not** ignored — only the image binaries and the
private checkpoint are.
