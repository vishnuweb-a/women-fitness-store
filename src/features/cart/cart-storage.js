/**
 * Cart and wishlist persistence: reading, validating, and migrating the
 * browser-local state.
 *
 * Kept separate from the provider so the rules can be tested directly — this
 * is the layer that has to survive a hand-edited, truncated, or stale
 * `localStorage` value without taking the storefront down with it.
 *
 * **Only identity is persisted**: product ID, the selected option labels, and
 * the quantity. Names, prices, and images are always derived from the catalog
 * at render time, so a catalog change is picked up immediately and a stale
 * price can never be shown.
 *
 * The stored option labels are **catalog selections, not inventory SKUs**. The
 * source lists sizes and colours independently and never says which
 * combinations exist; nothing here implies otherwise.
 */

/**
 * Storage keys.
 *
 * `v1` entries were written by Phase 1 as a bare array of lines. `v2` wraps
 * the lines in an envelope carrying the version, so a later shape change can
 * be detected rather than guessed at. Phase 1 data is migrated in, not
 * discarded — a real cart someone left in their browser must survive.
 */
export const CART_KEY_V1 = 'fitnex:cart:v1'
export const CART_KEY = 'fitnex:cart:v2'
export const WISHLIST_KEY = 'fitnex:wishlist:v1'
export const CART_VERSION = 2

export const MAX_QUANTITY = 99
/** An upper bound on distinct lines, so a corrupt file cannot exhaust memory. */
const MAX_LINES = 200

/**
 * Validate one persisted cart line.
 *
 * Returns a clean line or `null`. Everything is checked, because none of it is
 * trusted:
 *   - the product ID must be a non-empty string (IDs are strings in the
 *     normalised catalog; a number from an older write is coerced);
 *   - size and colour must be strings or absent — an object or an array here
 *     would otherwise flow into the line key and corrupt line identity;
 *   - the quantity must be a finite integer, clamped to 1–99. A zero, a
 *     negative, a fraction, a `NaN`, or `Infinity` is repaired rather than
 *     dropping the line, because the product the person chose is still signal.
 */
export function validateCartLine(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const productId =
    typeof raw.productId === 'string'
      ? raw.productId.trim()
      : typeof raw.productId === 'number' && Number.isFinite(raw.productId)
        ? String(raw.productId)
        : ''
  if (!productId) return null

  const option = (value) => {
    if (typeof value !== 'string') return null
    const text = value.trim()
    return text.length > 0 && text.length <= 100 ? text : null
  }

  const parsed = Number(raw.quantity)
  const quantity = Number.isFinite(parsed)
    ? Math.min(Math.max(Math.round(parsed), 1), MAX_QUANTITY)
    : 1

  return {
    productId,
    size: option(raw.size),
    color: option(raw.color),
    quantity,
  }
}

/**
 * Merge duplicate lines.
 *
 * Two stored entries can share a line key — a corrupt write, or a migration
 * from a shape that keyed lines differently. Their quantities are summed
 * (clamped), rather than one silently winning.
 */
function mergeLines(lines, keyOf) {
  const byKey = new Map()
  for (const line of lines) {
    const key = keyOf(line)
    const existing = byKey.get(key)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + line.quantity, MAX_QUANTITY)
    } else {
      byKey.set(key, { ...line })
    }
  }
  return [...byKey.values()].slice(0, MAX_LINES)
}

/**
 * Normalise any persisted cart payload into clean lines.
 *
 * Accepts both the v2 envelope (`{ version, lines }`) and the bare v1 array,
 * so Phase 1 carts migrate forward. Anything else yields an empty cart.
 */
export function normaliseCartPayload(payload, keyOf) {
  const rawLines = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray(payload.lines)
      ? payload.lines
      : []

  const valid = rawLines.slice(0, MAX_LINES * 2).map(validateCartLine).filter(Boolean)
  return mergeLines(valid, keyOf)
}

/** Normalise a persisted wishlist into a de-duplicated list of ID strings. */
export function normaliseWishlistPayload(payload) {
  if (!Array.isArray(payload)) return []
  const out = []
  const seen = new Set()
  for (const entry of payload.slice(0, MAX_LINES * 2)) {
    const id =
      typeof entry === 'string'
        ? entry.trim()
        : typeof entry === 'number' && Number.isFinite(entry)
          ? String(entry)
          : ''
    if (id && !seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

/** Parse a JSON string, returning `undefined` rather than throwing. */
function parseJson(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/**
 * Read the persisted cart, migrating a Phase 1 (`v1`) value when present.
 *
 * Every failure mode ends in an empty cart rather than an exception: no
 * storage at all (SSR, a test), storage that throws (some privacy modes throw
 * on access rather than returning null), unparseable JSON, or a payload of
 * the wrong shape.
 */
export function readCart(keyOf) {
  if (typeof window === 'undefined') return { lines: [], migrated: false }

  try {
    const current = parseJson(window.localStorage.getItem(CART_KEY))
    if (current !== undefined) {
      return { lines: normaliseCartPayload(current, keyOf), migrated: false }
    }

    // No v2 value — fall back to the Phase 1 key and migrate it forward.
    const legacy = parseJson(window.localStorage.getItem(CART_KEY_V1))
    if (legacy !== undefined) {
      return { lines: normaliseCartPayload(legacy, keyOf), migrated: true }
    }
  } catch {
    // Storage unavailable or throwing — start empty for this session.
  }

  return { lines: [], migrated: false }
}

/** Read the persisted wishlist, tolerating absence and corruption. */
export function readWishlist() {
  if (typeof window === 'undefined') return []
  try {
    return normaliseWishlistPayload(parseJson(window.localStorage.getItem(WISHLIST_KEY)))
  } catch {
    return []
  }
}

/** Write the cart in the current envelope. Storage failures are non-fatal. */
export function writeCart(lines) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      CART_KEY,
      JSON.stringify({ version: CART_VERSION, lines }),
    )
  } catch {
    // Private browsing or a full quota — the cart still works for this session.
  }
}

/** Write the wishlist. Storage failures are non-fatal. */
export function writeWishlist(ids) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids))
  } catch {
    // As above.
  }
}
