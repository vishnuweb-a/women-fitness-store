/**
 * Catalog service — the single source of normalised product data for the UI.
 *
 * `src/data/products.js` is generated from the scraper checkpoints and is left
 * untouched. This module adapts it: it does not replace, re-price, or invent
 * anything. Where the source is silent, the normalised shape says so rather
 * than guessing.
 *
 * Deliberate decisions, so later phases do not have to re-derive them:
 *
 *   - **Price units.** The source `price` is a whole-rupee integer (observed
 *     range 199–12499 across all 44 products, with no decimal values). It is
 *     therefore multiplied by 100 exactly once to reach paise. Values already
 *     in paise are never multiplied again.
 *   - **Ratings.** The scraped `rating`/`ratingCount` describe the original
 *     marketplace listing, not FITNEX. They are exposed under `sourceRating`
 *     so no component can mistake them for verified-buyer reviews collected by
 *     this store. FITNEX has collected no reviews; there are none to show.
 *   - **Inventory.** The source carries no stock data. `availability` is
 *     `'unknown'` for every product, and size/colour lists are independent
 *     option lists — a size and a colour appearing together does NOT imply
 *     that combination exists.
 *   - **Discounts.** Every product has `discountPercentage: 0` and
 *     `originalPrice === price`, so no product is marked down. `compareAtPaise`
 *     is null unless the source genuinely differs.
 */
import {
  categories as sourceCategories,
  products as sourceProducts,
} from '@/data/products'
import { resolveProductImage } from '@/lib/product-images'

/** Canonical category slugs, with the friendly labels used in navigation. */
export const CATEGORY_META = {
  'women-sportswear-clothing': {
    slug: 'women-sportswear-clothing',
    label: 'Sportswear',
    longLabel: 'Sportswear Clothing',
    productType: 'clothing',
    description: 'Jackets, tops, tights and training layers built to move with you.',
    banner: '/assets/banners/banner3.webp',
  },
  'women-sports-equipments': {
    slug: 'women-sports-equipments',
    label: 'Equipment',
    longLabel: 'Sports Equipment',
    productType: 'equipment',
    description: 'Rackets, bats, rollers and training gear for every session.',
    banner: '/assets/banners/banner5.webp',
  },
  'women-sports-accessories': {
    slug: 'women-sports-accessories',
    label: 'Accessories',
    longLabel: 'Sports Accessories',
    productType: 'accessory',
    description: 'Bags, gloves, socks and the small gear that carries the work.',
    banner: '/assets/banners/banner4.webp',
  },
}

/** Gallery ordering used by the scraper: front → model → side → back → detail. */
const VIEW_ORDER = ['front', 'model', 'side', 'back', 'detail']

function viewRank(view) {
  const index = VIEW_ORDER.indexOf(view ?? '')
  return index === -1 ? VIEW_ORDER.length : index
}

/**
 * Collapse runs of whitespace left by the scraper's text extraction.
 * Formatting only — no word is added, removed, or rewritten.
 */
function normaliseText(value) {
  if (typeof value !== 'string') return undefined
  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned.length > 0 ? cleaned : undefined
}

/** Drop blank entries from an option list, preserving order. */
function normaliseOptions(values) {
  if (!Array.isArray(values)) return []
  const seen = new Set()
  const out = []
  for (const value of values) {
    const text = normaliseText(String(value ?? ''))
    if (text && !seen.has(text)) {
      seen.add(text)
      out.push(text)
    }
  }
  return out
}

/**
 * Convert the source's whole-rupee price to an integer number of paise.
 * Returns null when the source value is not a usable number.
 */
function toPaise(rupees) {
  if (typeof rupees !== 'number' || !Number.isFinite(rupees) || rupees < 0) return null
  return Math.round(rupees * 100)
}

/** Build descriptive alt text for one gallery image. */
function altTextFor(product, image, index) {
  const base = normaliseText(product.name) ?? 'Product'
  if (image.view) return `${base} — ${image.view} view`
  return index === 0 ? base : `${base} — view ${index + 1}`
}

/** Normalise one source product into the shape components consume. */
function normaliseProduct(source) {
  const meta = CATEGORY_META[source.category]

  const gallery = [...(source.images ?? [])]
    .map((image, index) => ({ image, index }))
    .sort((a, b) => {
      const rank = viewRank(a.image.view) - viewRank(b.image.view)
      return rank !== 0 ? rank : a.index - b.index
    })
    .map(({ image }, index) => ({
      localSrc: image.src,
      src: resolveProductImage(image.src),
      view: image.view ?? null,
      width: image.width ?? null,
      height: image.height ?? null,
      alt: altTextFor(source, image, index),
    }))

  const pricePaise = toPaise(source.price)
  const originalPaise = toPaise(source.originalPrice)

  return {
    id: String(source.id),
    slug: source.slug,
    name: normaliseText(source.name) ?? source.slug,
    brand: normaliseText(source.brand),
    description: normaliseText(source.description),

    categorySlug: source.category,
    categoryLabel: meta?.label ?? source.categoryLabel,
    productType: meta?.productType ?? 'accessory',

    currency: source.currency ?? 'INR',
    pricePaise,
    // Only a genuinely higher original price is a compare-at price.
    compareAtPaise:
      originalPaise != null && pricePaise != null && originalPaise > pricePaise
        ? originalPaise
        : null,
    discountPercentage:
      typeof source.discountPercentage === 'number' && source.discountPercentage > 0
        ? source.discountPercentage
        : 0,

    images: gallery,
    primaryImage: gallery[0] ?? null,
    hasSingleImage: gallery.length <= 1,

    sizes: normaliseOptions(source.sizes),
    colors: normaliseOptions(source.colors),

    material: normaliseText(source.material),
    fit: normaliseText(source.fit),
    pattern: normaliseText(source.pattern),
    sport: normaliseText(source.sport),
    careInstructions: normaliseText(source.careInstructions),

    // Marketplace rating from the scrape — NOT a FITNEX review. Kept under a
    // distinct name so it cannot be rendered as a verified-buyer rating.
    sourceRating:
      typeof source.rating === 'number' && source.rating > 0
        ? { value: source.rating, count: source.ratingCount ?? 0, origin: 'marketplace-listing' }
        : null,

    // No stock data exists in the source. Never infer it.
    availability: 'unknown',

    provenance: {
      source: 'myntra-scraper-checkpoint',
      sourceId: String(source.id),
    },
  }
}

/** Every product, normalised. Computed once at module load. */
export const catalogProducts = sourceProducts.map(normaliseProduct)

/** Categories in display order, with real counts derived from the products. */
export const catalogCategories = sourceCategories.map((category) => {
  const meta = CATEGORY_META[category.slug]
  const items = catalogProducts.filter((p) => p.categorySlug === category.slug)
  return {
    slug: category.slug,
    label: meta?.label ?? category.label,
    longLabel: meta?.longLabel ?? category.label,
    description: meta?.description,
    banner: meta?.banner,
    productType: meta?.productType,
    count: items.length,
    previewImage: items[0]?.primaryImage ?? null,
  }
})

const bySlug = new Map(catalogProducts.map((product) => [product.slug, product]))
const byId = new Map(catalogProducts.map((product) => [product.id, product]))

/** A single product by slug, or `undefined` when the slug is not in the catalog. */
export function getProductBySlug(slug) {
  return slug ? bySlug.get(slug) : undefined
}

/** A single product by its stable ID, or `undefined`. */
export function getProductById(id) {
  return id ? byId.get(String(id)) : undefined
}

/** Products in one category, in catalog order. */
export function getProductsByCategory(categorySlug) {
  return catalogProducts.filter((product) => product.categorySlug === categorySlug)
}

/** A category's metadata by slug, or `undefined` for an unknown slug. */
export function getCategory(slug) {
  return catalogCategories.find((category) => category.slug === slug)
}

/**
 * Search the catalog by name, brand, category, sport, and material.
 *
 * Every term must match somewhere in the product's searchable text, so adding
 * a word narrows the result set rather than widening it.
 */
export function searchProducts(query, { limit = 24 } = {}) {
  const terms = String(query ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) return []

  const scored = []
  for (const product of catalogProducts) {
    const haystack = [
      product.name,
      product.brand,
      product.categoryLabel,
      product.productType,
      product.sport,
      product.material,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    if (!terms.every((term) => haystack.includes(term))) continue

    // A match in the name outranks a match only in the supporting fields.
    const name = product.name.toLowerCase()
    const score = terms.reduce(
      (total, term) => total + (name.startsWith(term) ? 3 : name.includes(term) ? 2 : 1),
      0,
    )
    scored.push({ product, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((entry) => entry.product)
}

/**
 * A stable, deterministic selection for a curated homepage section.
 *
 * Deterministic so the server-free build renders the same order on every load.
 * The title these feed is neutral ("Featured", "More to explore") — the source
 * data supports no sales-rank or recency claim.
 */
export function getCuratedProducts({ count = 8, offset = 0, perCategory = true } = {}) {
  if (!perCategory) return catalogProducts.slice(offset, offset + count)

  // Round-robin across categories so a curated row is never all one type.
  const buckets = catalogCategories.map((category) =>
    getProductsByCategory(category.slug),
  )
  const out = []
  let index = offset
  while (out.length < count) {
    let added = false
    for (const bucket of buckets) {
      const product = bucket[index % Math.max(bucket.length, 1)]
      if (product && !out.includes(product)) {
        out.push(product)
        added = true
        if (out.length === count) break
      }
    }
    index += 1
    if (!added) break
  }
  return out
}

/** Format an integer paise amount as Indian rupees. */
export function formatPrice(paise, currency = 'INR') {
  if (typeof paise !== 'number' || !Number.isFinite(paise)) return null
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(paise / 100)
}
