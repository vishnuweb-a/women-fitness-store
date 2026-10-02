/**
 * Pure state machine behind the demo checkout.
 *
 * Kept free of React so every rule below is testable on its own: the reducer,
 * the step guard, the cart signature, and the snapshot builder.
 *
 * ## Privacy
 *
 * Everything here lives in memory for the lifetime of one page session.
 * Contact and address values are **never** written to `localStorage`,
 * `sessionStorage`, the URL, a cookie, a log, or the cart storage. A reload
 * deliberately loses the draft — that is the privacy property, not a bug, and
 * the UI explains it rather than silently restarting.
 */

/** Ordered checkout steps. The index is the step indicator's position. */
export const CHECKOUT_STEPS = [
  { id: 'bag', label: 'Bag', path: '/cart' },
  { id: 'delivery', label: 'Delivery', path: '/checkout' },
  { id: 'payment', label: 'Payment', path: '/checkout/payment' },
  { id: 'confirmation', label: 'Confirmation', path: null },
]

export const initialCheckoutState = {
  /** Validated delivery + contact values, or null before step 1 is submitted. */
  delivery: null,
  /** `{ sameAsDelivery, billingAddress }`, or null before step 2 is submitted. */
  billing: null,
  /** One of `PAYMENT_METHOD_IDS`, or null. */
  paymentMethod: null,
  /**
   * The cart signature that step 1 was completed against. When the live cart
   * stops matching this, the review is stale and must be re-confirmed.
   */
  reviewedCartSignature: null,
  /** True once the person has acknowledged a cart change mid-checkout. */
  reviewAcknowledged: false,
  /** Frozen snapshots of completed demo checkouts, keyed by demo reference. */
  completed: {},
}

/**
 * A stable fingerprint of the priced cart lines.
 *
 * Covers product, options, quantity, and unit price — a price change matters
 * as much as an added line, because the review showed a number that is no
 * longer current. Order-independent, so re-ordered lines are not a change.
 */
export function cartSignature(cartItems) {
  if (!Array.isArray(cartItems)) return ''
  return cartItems
    .map((item) =>
      [
        item.line?.productId ?? '',
        item.line?.size ?? '',
        item.line?.color ?? '',
        item.quantity ?? 0,
        item.unitPaise ?? 0,
      ]
        .map((part) => JSON.stringify(part))
        .join(':'),
    )
    .sort()
    .join('|')
}

export function checkoutReducer(state, action) {
  switch (action.type) {
    case 'set-delivery':
      return {
        ...state,
        delivery: action.delivery,
        reviewedCartSignature: action.cartSignature,
        reviewAcknowledged: false,
      }

    case 'set-payment':
      return {
        ...state,
        billing: action.billing,
        paymentMethod: action.paymentMethod,
      }

    /** Re-confirm the review against the cart as it now stands. */
    case 'acknowledge-cart-change':
      return {
        ...state,
        reviewedCartSignature: action.cartSignature,
        reviewAcknowledged: true,
      }

    /**
     * Freeze a completed demo checkout.
     *
     * The snapshot is deep-frozen so nothing downstream — a later cart edit,
     * a re-render, a careless mutation — can alter what the confirmation page
     * reports. A reference is never overwritten once recorded.
     */
    case 'complete': {
      if (state.completed[action.snapshot.reference]) return state
      return {
        ...state,
        completed: {
          ...state.completed,
          [action.snapshot.reference]: deepFreeze(action.snapshot),
        },
      }
    }

    /** Clear the in-memory draft. Completed snapshots are kept. */
    case 'reset-draft':
      return {
        ...state,
        delivery: null,
        billing: null,
        paymentMethod: null,
        reviewedCartSignature: null,
        reviewAcknowledged: false,
      }

    default:
      return state
  }
}

/** Recursively freeze plain objects and arrays. */
export function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const key of Object.keys(value)) deepFreeze(value[key])
  return Object.freeze(value)
}

/**
 * Which step a given route may be entered at.
 *
 * Returns `{ allowed }` or `{ allowed: false, redirectTo, reason }`. The
 * reason is shown to the person — arriving at a guarded step without a draft
 * is an ordinary thing to do (a reload, a bookmark, a shared link), so it is
 * explained rather than treated as an error.
 */
export function resolveStepAccess({ step, state, hasCartItems }) {
  if (step === 'delivery' || step === 'payment') {
    if (!hasCartItems) {
      return {
        allowed: false,
        redirectTo: '/cart',
        reason:
          'Your bag is empty, so there is nothing to check out. Add an item to continue.',
      }
    }
  }

  if (step === 'payment' && !state.delivery) {
    return {
      allowed: false,
      redirectTo: '/checkout',
      reason:
        'Delivery details are not held in this browser session, so the billing step has nothing to work from. Enter them again to continue.',
    }
  }

  return { allowed: true }
}

/**
 * Is the review stale relative to the live cart?
 *
 * True when the cart has changed since the delivery step was completed and
 * that change has not yet been acknowledged. Completion is blocked while this
 * is true, so a demo checkout is never finished against items nobody reviewed.
 */
export function isReviewStale({ state, signature }) {
  if (!state.reviewedCartSignature) return false
  return state.reviewedCartSignature !== signature
}

/**
 * Build the frozen record of a completed demo checkout.
 *
 * Totals are recomputed from the items passed in — the live, catalog-derived
 * cart — in integer paise. No shipping, tax, or grand total is included,
 * because none of those can be calculated in this build.
 */
export function buildDemoSnapshot({ reference, cartItems, delivery, billingAddress, paymentMethod }) {
  const items = cartItems.map((item) => ({
    key: item.key,
    productId: item.product.id,
    slug: item.product.slug,
    name: item.product.name,
    brand: item.product.brand ?? null,
    image: item.product.primaryImage ?? null,
    currency: item.product.currency ?? 'INR',
    size: item.line.size ?? null,
    color: item.line.color ?? null,
    quantity: item.quantity,
    unitPaise: item.unitPaise,
    subtotalPaise: item.unitPaise * item.quantity,
  }))

  return {
    reference,
    createdAt: new Date().toISOString(),
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    merchandiseSubtotalPaise: items.reduce((total, item) => total + item.subtotalPaise, 0),
    contact: { email: delivery.email, phone: delivery.phone },
    deliveryAddress: addressOf(delivery),
    billingAddress,
    paymentMethod,
  }
}

function addressOf(delivery) {
  const { email: _email, phone: _phone, ...address } = delivery
  return address
}

/**
 * A frontend-only demo reference.
 *
 * `crypto.randomUUID` is the reliable unique identifier here; its first block
 * is rendered as a short, readable code. The `DEMO-` prefix is deliberate —
 * this must never be mistaken for a real order number anywhere it appears.
 */
export function createDemoReference() {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : fallbackUuid()
  return `DEMO-${uuid.slice(0, 8).toUpperCase()}-${uuid.slice(9, 13).toUpperCase()}`
}

/** Only reached on a browser without `crypto.randomUUID`. */
function fallbackUuid() {
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
