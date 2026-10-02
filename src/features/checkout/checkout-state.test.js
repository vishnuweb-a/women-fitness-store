import { describe, expect, it } from 'vitest'

import {
  buildDemoSnapshot,
  cartSignature,
  CHECKOUT_STEPS,
  checkoutReducer,
  createDemoReference,
  deepFreeze,
  initialCheckoutState,
  isReviewStale,
  resolveStepAccess,
} from '@/features/checkout/checkout-state'

/** A priced cart line, shaped as `StoreProvider` derives it. */
function item({ id = '1', size = null, color = null, quantity = 1, unitPaise = 179900 } = {}) {
  return {
    key: `${id}::${size}::${color}`,
    line: { productId: id, size, color, quantity },
    product: {
      id,
      slug: `product-${id}`,
      name: `Product ${id}`,
      brand: 'FITNEX',
      currency: 'INR',
      primaryImage: { url: `/img/${id}.jpg` },
    },
    quantity,
    unitPaise,
    subtotalPaise: unitPaise * quantity,
  }
}

const delivery = {
  email: 'ananya@example.com',
  phone: '9876543210',
  firstName: 'Ananya',
  lastName: 'Sharma',
  addressLine1: '123 Green Park',
  addressLine2: '',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560034',
  country: 'India',
}

describe('cartSignature', () => {
  it('is stable for the same cart', () => {
    const cart = [item({ id: '1' }), item({ id: '2', quantity: 3 })]
    expect(cartSignature(cart)).toBe(cartSignature(cart.slice()))
  })

  it('ignores line order', () => {
    const a = [item({ id: '1' }), item({ id: '2' })]
    expect(cartSignature(a)).toBe(cartSignature([...a].reverse()))
  })

  it('changes when a quantity changes', () => {
    expect(cartSignature([item({ quantity: 1 })])).not.toBe(
      cartSignature([item({ quantity: 2 })]),
    )
  })

  it('changes when a line is added or removed', () => {
    const one = [item({ id: '1' })]
    expect(cartSignature(one)).not.toBe(cartSignature([...one, item({ id: '2' })]))
  })

  it('changes when a selected option changes', () => {
    expect(cartSignature([item({ size: 'S' })])).not.toBe(cartSignature([item({ size: 'M' })]))
  })

  it('changes when a unit price changes', () => {
    // A price change matters as much as an added line: the review showed a
    // number that is no longer current.
    expect(cartSignature([item({ unitPaise: 179900 })])).not.toBe(
      cartSignature([item({ unitPaise: 199900 })]),
    )
  })

  it('does not confuse distinct option labels', () => {
    expect(cartSignature([item({ size: 'S', color: null })])).not.toBe(
      cartSignature([item({ size: null, color: 'S' })]),
    )
  })

  it('handles an empty or absent cart', () => {
    expect(cartSignature([])).toBe('')
    expect(cartSignature(undefined)).toBe('')
  })
})

describe('step guards', () => {
  it('blocks delivery when the bag is empty', () => {
    const access = resolveStepAccess({
      step: 'delivery',
      state: initialCheckoutState,
      hasCartItems: false,
    })
    expect(access.allowed).toBe(false)
    expect(access.redirectTo).toBe('/cart')
    expect(access.reason).toMatch(/bag is empty/i)
  })

  it('allows delivery with items in the bag', () => {
    expect(
      resolveStepAccess({ step: 'delivery', state: initialCheckoutState, hasCartItems: true })
        .allowed,
    ).toBe(true)
  })

  it('blocks payment on direct entry without a delivery draft', () => {
    const access = resolveStepAccess({
      step: 'payment',
      state: initialCheckoutState,
      hasCartItems: true,
    })
    expect(access.allowed).toBe(false)
    expect(access.redirectTo).toBe('/checkout')
  })

  it('blocks payment on an empty bag before it complains about the draft', () => {
    const state = { ...initialCheckoutState, delivery }
    const access = resolveStepAccess({ step: 'payment', state, hasCartItems: false })
    expect(access.allowed).toBe(false)
    expect(access.redirectTo).toBe('/cart')
  })

  it('allows payment once delivery is complete', () => {
    const state = { ...initialCheckoutState, delivery }
    expect(resolveStepAccess({ step: 'payment', state, hasCartItems: true }).allowed).toBe(true)
  })

  it('names four ordered steps ending at confirmation', () => {
    expect(CHECKOUT_STEPS.map((step) => step.id)).toEqual([
      'bag',
      'delivery',
      'payment',
      'confirmation',
    ])
    // Confirmation has no route to return to — it is not a step you go back to.
    expect(CHECKOUT_STEPS.at(-1).path).toBeNull()
  })
})

describe('review invalidation', () => {
  const cart = [item({ id: '1' })]
  const signature = cartSignature(cart)

  it('is not stale before delivery has been submitted', () => {
    expect(isReviewStale({ state: initialCheckoutState, signature })).toBe(false)
  })

  it('is not stale while the cart matches what was reviewed', () => {
    const state = checkoutReducer(initialCheckoutState, {
      type: 'set-delivery',
      delivery,
      cartSignature: signature,
    })
    expect(isReviewStale({ state, signature })).toBe(false)
  })

  it('becomes stale when the cart changes mid-checkout', () => {
    const state = checkoutReducer(initialCheckoutState, {
      type: 'set-delivery',
      delivery,
      cartSignature: signature,
    })
    const changed = cartSignature([...cart, item({ id: '2' })])
    expect(isReviewStale({ state, signature: changed })).toBe(true)
  })

  it('clears once the updated cart is acknowledged', () => {
    let state = checkoutReducer(initialCheckoutState, {
      type: 'set-delivery',
      delivery,
      cartSignature: signature,
    })
    const changed = cartSignature([...cart, item({ id: '2' })])
    expect(isReviewStale({ state, signature: changed })).toBe(true)

    state = checkoutReducer(state, { type: 'acknowledge-cart-change', cartSignature: changed })
    expect(isReviewStale({ state, signature: changed })).toBe(false)
    expect(state.reviewAcknowledged).toBe(true)
  })

  it('becomes stale again if the cart changes a second time', () => {
    let state = checkoutReducer(initialCheckoutState, {
      type: 'set-delivery',
      delivery,
      cartSignature: signature,
    })
    const second = cartSignature([...cart, item({ id: '2' })])
    state = checkoutReducer(state, { type: 'acknowledge-cart-change', cartSignature: second })
    const third = cartSignature([...cart, item({ id: '2' }), item({ id: '3' })])
    expect(isReviewStale({ state, signature: third })).toBe(true)
  })

  it('re-submitting delivery re-bases the review on the current cart', () => {
    const state = checkoutReducer(initialCheckoutState, {
      type: 'set-delivery',
      delivery,
      cartSignature: signature,
    })
    const changed = cartSignature([...cart, item({ id: '2' })])
    const resubmitted = checkoutReducer(state, {
      type: 'set-delivery',
      delivery,
      cartSignature: changed,
    })
    expect(isReviewStale({ state: resubmitted, signature: changed })).toBe(false)
    expect(resubmitted.reviewAcknowledged).toBe(false)
  })
})

describe('reducer', () => {
  it('stores delivery values', () => {
    const state = checkoutReducer(initialCheckoutState, {
      type: 'set-delivery',
      delivery,
      cartSignature: 'sig',
    })
    expect(state.delivery).toEqual(delivery)
    expect(state.reviewedCartSignature).toBe('sig')
  })

  it('stores billing and the chosen method', () => {
    const state = checkoutReducer(initialCheckoutState, {
      type: 'set-payment',
      billing: { sameAsDelivery: true, billingAddress: null },
      paymentMethod: 'upi',
    })
    expect(state.billing.sameAsDelivery).toBe(true)
    expect(state.paymentMethod).toBe('upi')
  })

  it('clears the draft but keeps completed snapshots', () => {
    let state = checkoutReducer(initialCheckoutState, {
      type: 'set-delivery',
      delivery,
      cartSignature: 'sig',
    })
    state = checkoutReducer(state, {
      type: 'complete',
      snapshot: { reference: 'DEMO-1', items: [] },
    })
    state = checkoutReducer(state, { type: 'reset-draft' })

    expect(state.delivery).toBeNull()
    expect(state.paymentMethod).toBeNull()
    expect(state.reviewedCartSignature).toBeNull()
    expect(state.completed['DEMO-1']).toBeTruthy()
  })

  it('ignores an unknown action', () => {
    expect(checkoutReducer(initialCheckoutState, { type: 'nope' })).toBe(initialCheckoutState)
  })
})

describe('demo snapshot', () => {
  const cart = [
    item({ id: '1', quantity: 2, unitPaise: 179900, size: 'M' }),
    item({ id: '2', quantity: 1, unitPaise: 129900 }),
  ]

  const snapshot = buildDemoSnapshot({
    reference: 'DEMO-TEST',
    cartItems: cart,
    delivery,
    billingAddress: { ...delivery, email: undefined, phone: undefined },
    paymentMethod: 'upi',
  })

  it('computes the subtotal in integer paise from the live cart', () => {
    // 2 x 179900 + 1 x 129900, exactly — no float arithmetic anywhere.
    expect(snapshot.merchandiseSubtotalPaise).toBe(489700)
    expect(Number.isInteger(snapshot.merchandiseSubtotalPaise)).toBe(true)
    expect(snapshot.itemCount).toBe(3)
  })

  it('records each line with its own subtotal', () => {
    expect(snapshot.items[0].subtotalPaise).toBe(359800)
    expect(snapshot.items[1].subtotalPaise).toBe(129900)
  })

  it('keeps the selected option labels', () => {
    expect(snapshot.items[0].size).toBe('M')
    expect(snapshot.items[1].size).toBeNull()
  })

  it('carries no shipping, tax, or grand total', () => {
    // None of these can be calculated in this build, so none may be recorded.
    for (const key of ['shipping', 'tax', 'taxes', 'total', 'grandTotal', 'payablePaise']) {
      expect(snapshot, key).not.toHaveProperty(key)
    }
  })

  it('separates contact details from the delivery address', () => {
    expect(snapshot.contact).toEqual({ email: delivery.email, phone: delivery.phone })
    expect(snapshot.deliveryAddress).not.toHaveProperty('email')
    expect(snapshot.deliveryAddress).not.toHaveProperty('phone')
  })

  it('is immutable once recorded', () => {
    const state = checkoutReducer(initialCheckoutState, { type: 'complete', snapshot })
    const stored = state.completed['DEMO-TEST']

    expect(Object.isFrozen(stored)).toBe(true)
    expect(Object.isFrozen(stored.items)).toBe(true)
    expect(Object.isFrozen(stored.items[0])).toBe(true)
    expect(Object.isFrozen(stored.deliveryAddress)).toBe(true)
  })

  it('is not overwritten if the same reference is completed again', () => {
    let state = checkoutReducer(initialCheckoutState, { type: 'complete', snapshot })
    state = checkoutReducer(state, {
      type: 'complete',
      snapshot: { ...snapshot, merchandiseSubtotalPaise: 1 },
    })
    expect(state.completed['DEMO-TEST'].merchandiseSubtotalPaise).toBe(489700)
  })

  it('survives a later change to the cart it was built from', () => {
    const state = checkoutReducer(initialCheckoutState, { type: 'complete', snapshot })
    // Mutating the source cart must not reach the frozen snapshot.
    cart[0].quantity = 99
    expect(state.completed['DEMO-TEST'].items[0].quantity).toBe(2)
  })
})

describe('deepFreeze', () => {
  it('freezes nested objects and arrays', () => {
    const frozen = deepFreeze({ a: { b: [{ c: 1 }] } })
    expect(Object.isFrozen(frozen.a.b[0])).toBe(true)
  })

  it('passes through primitives and null', () => {
    expect(deepFreeze(null)).toBeNull()
    expect(deepFreeze(5)).toBe(5)
  })
})

describe('demo reference', () => {
  it('is prefixed so it can never read as an order number', () => {
    expect(createDemoReference()).toMatch(/^DEMO-[0-9A-F]{8}-[0-9A-F]{4}$/)
  })

  it('is unique across many generations', () => {
    const seen = new Set()
    for (let i = 0; i < 2000; i += 1) seen.add(createDemoReference())
    expect(seen.size).toBe(2000)
  })
})
