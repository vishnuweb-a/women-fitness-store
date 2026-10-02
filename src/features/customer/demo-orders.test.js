/**
 * Tests for the demo-order integration.
 *
 * The property under test is that the customer orders page is a **read** of
 * the checkout provider's snapshots and nothing more: the same builder, the
 * same frozen records, no second store, and no field invented along the way.
 * So these tests build snapshots with the real `buildDemoSnapshot` rather
 * than with hand-written fixtures that could drift from it.
 */
import { describe, expect, it } from 'vitest'

import { buildDemoSnapshot, checkoutReducer, initialCheckoutState } from '@/features/checkout/checkout-state'
import { listDemoSnapshots } from '@/features/customer/demo-orders'

const delivery = {
  firstName: 'Asha',
  lastName: 'Rao',
  addressLine1: '12 Residency Road',
  addressLine2: '',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560025',
  country: 'India',
  email: 'asha@example.com',
  phone: '9876543210',
}

function cartItem({ id = '1', price = 99900, quantity = 1 } = {}) {
  return {
    key: `line-${id}`,
    line: { productId: id, size: null, color: null },
    quantity,
    unitPaise: price,
    product: {
      id,
      slug: `product-${id}`,
      name: `Product ${id}`,
      brand: 'FITNEX',
      primaryImage: null,
      currency: 'INR',
      pricePaise: price,
    },
  }
}

function snapshotWith({ reference, cartItems = [cartItem()], paymentMethod = 'upi' }) {
  return buildDemoSnapshot({
    reference,
    cartItems,
    delivery,
    billingAddress: { ...delivery, email: undefined, phone: undefined },
    paymentMethod,
  })
}

/** Record snapshots through the real reducer, as the provider does. */
function completedState(snapshots) {
  return snapshots.reduce(
    (state, snapshot) => checkoutReducer(state, { type: 'complete', snapshot }),
    initialCheckoutState,
  )
}

describe('listDemoSnapshots', () => {
  it('returns an empty list when nothing has been completed', () => {
    expect(listDemoSnapshots(initialCheckoutState.completed)).toEqual([])
  })

  it('tolerates a missing completed map', () => {
    expect(listDemoSnapshots(undefined)).toEqual([])
    expect(listDemoSnapshots(null)).toEqual([])
  })

  it('reads the snapshots recorded by the checkout reducer', () => {
    const state = completedState([snapshotWith({ reference: 'DEMO-AAAA1111-BBBB' })])
    const listed = listDemoSnapshots(state.completed)

    expect(listed).toHaveLength(1)
    expect(listed[0].reference).toBe('DEMO-AAAA1111-BBBB')
  })

  it('orders snapshots newest first by recorded completion time', () => {
    const older = { ...snapshotWith({ reference: 'DEMO-OLD' }), createdAt: '2026-01-01T10:00:00.000Z' }
    const newer = { ...snapshotWith({ reference: 'DEMO-NEW' }), createdAt: '2026-02-01T10:00:00.000Z' }

    // Inserted oldest-first, so insertion order alone would give the wrong
    // answer — the sort has to be doing the work.
    const state = completedState([older, newer])
    expect(listDemoSnapshots(state.completed).map((s) => s.reference)).toEqual([
      'DEMO-NEW',
      'DEMO-OLD',
    ])
  })

  it('does not drop a snapshot that recorded no completion time', () => {
    const undated = { ...snapshotWith({ reference: 'DEMO-UNDATED' }), createdAt: undefined }
    const state = completedState([undated])
    expect(listDemoSnapshots(state.completed)).toHaveLength(1)
  })
})

describe('demo snapshots as the orders page reads them', () => {
  it('carries only the fields the page can honestly show', () => {
    const snapshot = snapshotWith({ reference: 'DEMO-FIELDS' })

    // Everything the orders page renders.
    expect(snapshot).toHaveProperty('reference')
    expect(snapshot).toHaveProperty('createdAt')
    expect(snapshot).toHaveProperty('items')
    expect(snapshot).toHaveProperty('merchandiseSubtotalPaise')
    expect(snapshot).toHaveProperty('paymentMethod')

    // None of these exists, and the page must never be able to render one.
    for (const absent of [
      'status',
      'paymentStatus',
      'fulfillmentStatus',
      'trackingNumber',
      'carrier',
      'invoiceUrl',
      'estimatedDelivery',
      'deliveredAt',
      'refund',
      'cancellable',
      'grandTotalPaise',
      'shippingPaise',
      'taxPaise',
    ]) {
      expect(snapshot).not.toHaveProperty(absent)
    }
  })

  it('totals the merchandise subtotal in integer paise', () => {
    const snapshot = snapshotWith({
      reference: 'DEMO-TOTAL',
      cartItems: [
        cartItem({ id: '1', price: 99900, quantity: 2 }),
        cartItem({ id: '2', price: 49950, quantity: 1 }),
      ],
    })
    expect(snapshot.merchandiseSubtotalPaise).toBe(99900 * 2 + 49950)
    expect(Number.isInteger(snapshot.merchandiseSubtotalPaise)).toBe(true)
    expect(snapshot.itemCount).toBe(3)
  })

  it('keeps the recorded demo reference prefixed so it cannot read as an order number', () => {
    const state = completedState([snapshotWith({ reference: 'DEMO-PREFIX-TEST' })])
    for (const snapshot of listDemoSnapshots(state.completed)) {
      expect(snapshot.reference.startsWith('DEMO-')).toBe(true)
    }
  })

  /**
   * Immutability matters here specifically because the orders page lists the
   * same objects the confirmation page renders. A careless edit in one would
   * otherwise change what the other reports about a completed checkout.
   */
  it('exposes snapshots that cannot be mutated by a reader', () => {
    const state = completedState([snapshotWith({ reference: 'DEMO-FROZEN' })])
    const [snapshot] = listDemoSnapshots(state.completed)

    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.items)).toBe(true)
    expect(Object.isFrozen(snapshot.items[0])).toBe(true)

    expect(() => {
      'use strict'
      snapshot.merchandiseSubtotalPaise = 1
    }).toThrow()
    expect(snapshot.merchandiseSubtotalPaise).not.toBe(1)
  })

  it('never overwrites a reference that is already recorded', () => {
    const first = snapshotWith({ reference: 'DEMO-SAME', cartItems: [cartItem({ id: '1' })] })
    const second = {
      ...snapshotWith({ reference: 'DEMO-SAME', cartItems: [cartItem({ id: '2' })] }),
    }

    const state = completedState([first, second])
    const listed = listDemoSnapshots(state.completed)

    expect(listed).toHaveLength(1)
    expect(listed[0].items[0].productId).toBe('1')
  })

  it('records no personal detail beyond what the checkout step collected', () => {
    const snapshot = snapshotWith({ reference: 'DEMO-CONTACT' })
    expect(Object.keys(snapshot.contact).sort()).toEqual(['email', 'phone'])
  })
})
