import { describe, expect, it } from 'vitest'

import {
  addressSchema,
  billingSchema,
  deliverySchema,
  emptyAddress,
  FIXED_COUNTRY,
  formatPhone,
  getPaymentMethodLabel,
  INDIAN_STATES,
  normalisePhone,
  paymentSchema,
  PAYMENT_METHOD_IDS,
  resolveBillingAddress,
} from '@/features/checkout/checkout-schema'

/** A valid address, as the forms would produce it. */
const validAddress = {
  firstName: 'Ananya',
  lastName: 'Sharma',
  addressLine1: '123 Green Park Apartments, MG Road',
  addressLine2: 'Koramangala',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560034',
  country: FIXED_COUNTRY,
}

const validDelivery = {
  ...validAddress,
  email: 'ananya.sharma@example.com',
  phone: '9876543210',
}

/** Collect every error message for a given field path. */
function messagesFor(result, path) {
  if (result.success) return []
  return result.error.issues
    .filter((issue) => issue.path.join('.') === path)
    .map((issue) => issue.message)
}

describe('phone normalisation', () => {
  it('accepts the forms people actually type', () => {
    for (const input of [
      '9876543210',
      '+919876543210',
      '+91 98765 43210',
      '+91-98765-43210',
      '09876543210',
      '919876543210',
      '98765 43210',
      '  9876543210  ',
    ]) {
      expect(normalisePhone(input), input).toBe('9876543210')
    }
  })

  it('rejects numbers that are not Indian mobile numbers', () => {
    for (const input of [
      '1234567890', // does not start 6-9
      '5876543210',
      '987654321', // nine digits
      '98765432101', // eleven digits
      '+1 415 555 0100',
      'not a number',
      '',
    ]) {
      expect(normalisePhone(input), input).toBeNull()
    }
  })

  it('stores the ten-digit form regardless of how it was typed', () => {
    const a = deliverySchema.parse({ ...validDelivery, phone: '+91 98765 43210' })
    const b = deliverySchema.parse({ ...validDelivery, phone: '09876543210' })
    expect(a.phone).toBe('9876543210')
    expect(b.phone).toBe(a.phone)
  })

  it('formats a stored number for display', () => {
    expect(formatPhone('9876543210')).toBe('+91 98765 43210')
    // A value that is not ten digits is passed through rather than mangled.
    expect(formatPhone('123')).toBe('123')
  })
})

describe('delivery validation', () => {
  it('accepts a complete address', () => {
    const result = deliverySchema.safeParse(validDelivery)
    expect(result.success).toBe(true)
  })

  it('trims before validating, so whitespace is not a value', () => {
    const result = deliverySchema.safeParse({
      ...validDelivery,
      firstName: '   ',
      city: '  ',
    })
    expect(result.success).toBe(false)
    expect(messagesFor(result, 'firstName')).toContain('Enter a first name.')
    expect(messagesFor(result, 'city')).toContain('Enter a city.')
  })

  it('trims surrounding whitespace off accepted values', () => {
    const parsed = deliverySchema.parse({
      ...validDelivery,
      firstName: '  Ananya  ',
      city: ' Bengaluru ',
    })
    expect(parsed.firstName).toBe('Ananya')
    expect(parsed.city).toBe('Bengaluru')
  })

  it('requires a well-formed email address', () => {
    for (const email of ['', 'nope', 'nope@', '@example.com', 'a b@example.com']) {
      const result = deliverySchema.safeParse({ ...validDelivery, email })
      expect(result.success, email).toBe(false)
      expect(messagesFor(result, 'email').length).toBeGreaterThan(0)
    }
  })

  it('requires a six-digit PIN code that does not start with zero', () => {
    for (const postalCode of ['', '12345', '1234567', '060034', 'ABCDEF', '56 0034']) {
      const result = deliverySchema.safeParse({ ...validDelivery, postalCode })
      expect(result.success, postalCode).toBe(false)
      expect(messagesFor(result, 'postalCode')).toContain('Enter a 6-digit PIN code.')
    }
    expect(deliverySchema.safeParse({ ...validDelivery, postalCode: '110001' }).success).toBe(
      true,
    )
  })

  it('treats address line 2 as genuinely optional', () => {
    const result = deliverySchema.safeParse({ ...validDelivery, addressLine2: '' })
    expect(result.success).toBe(true)
  })

  it('requires a state and accepts only listed ones from the select', () => {
    const result = deliverySchema.safeParse({ ...validDelivery, state: '' })
    expect(result.success).toBe(false)
    expect(messagesFor(result, 'state')).toContain('Select a state or union territory.')
    // Every option the select renders must pass the schema.
    for (const state of INDIAN_STATES) {
      expect(deliverySchema.safeParse({ ...validDelivery, state }).success, state).toBe(true)
    }
  })

  it('reports every invalid field at once rather than one at a time', () => {
    const result = deliverySchema.safeParse({
      ...emptyAddress,
      email: 'nope',
      phone: '123',
    })
    expect(result.success).toBe(false)
    const fields = new Set(result.error.issues.map((issue) => issue.path[0]))
    // The first invalid field can only be focused if all of them are reported.
    expect(fields).toContain('email')
    expect(fields).toContain('phone')
    expect(fields).toContain('firstName')
    expect(fields).toContain('postalCode')
  })

  it('fixes the country to India', () => {
    const result = deliverySchema.safeParse({ ...validDelivery, country: 'Nepal' })
    expect(result.success).toBe(false)
  })
})

describe('billing validation', () => {
  it('passes with no billing address at all when same-as-delivery is selected', () => {
    const result = billingSchema.safeParse({ sameAsDelivery: true })
    expect(result.success).toBe(true)
  })

  it('does not let a hidden billing form block progression', () => {
    // The alternate form is not rendered, but its half-filled values are still
    // in the form state. They must not produce errors.
    const result = billingSchema.safeParse({
      sameAsDelivery: true,
      billingAddress: { ...emptyAddress, postalCode: 'nonsense' },
    })
    expect(result.success).toBe(true)
  })

  it('validates the alternate billing address when it is shown', () => {
    const result = billingSchema.safeParse({
      sameAsDelivery: false,
      billingAddress: { ...emptyAddress, postalCode: '12' },
    })
    expect(result.success).toBe(false)
    expect(messagesFor(result, 'billingAddress.postalCode')).toContain(
      'Enter a 6-digit PIN code.',
    )
    expect(messagesFor(result, 'billingAddress.firstName')).toContain('Enter a first name.')
  })

  it('applies the same rules to billing as to delivery', () => {
    const result = billingSchema.safeParse({
      sameAsDelivery: false,
      billingAddress: validAddress,
    })
    expect(result.success).toBe(true)
  })

  it('trims an accepted alternate billing address', () => {
    // Otherwise the same address typed into both forms would render
    // differently on the review step.
    const parsed = billingSchema.parse({
      sameAsDelivery: false,
      billingAddress: { ...validAddress, firstName: '  Ananya  ', city: ' Pune ' },
    })
    expect(parsed.billingAddress.firstName).toBe('Ananya')
    expect(parsed.billingAddress.city).toBe('Pune')
  })

  it('drops any alternate address when same-as-delivery is selected', () => {
    // A copy kept here is exactly the staleness this flow must not have: the
    // address is derived from the live delivery address instead.
    const parsed = billingSchema.parse({
      sameAsDelivery: true,
      billingAddress: { ...validAddress, city: 'Chennai' },
    })
    expect(parsed.billingAddress).toBeNull()
  })
})

describe('payment validation', () => {
  it('requires a payment method', () => {
    const result = paymentSchema.safeParse({ sameAsDelivery: true, paymentMethod: '' })
    expect(result.success).toBe(false)
    expect(messagesFor(result, 'paymentMethod')).toContain(
      'Select a payment method to continue.',
    )
  })

  it('accepts each offered demo method', () => {
    for (const paymentMethod of PAYMENT_METHOD_IDS) {
      const result = paymentSchema.safeParse({ sameAsDelivery: true, paymentMethod })
      expect(result.success, paymentMethod).toBe(true)
    }
  })

  it('rejects a method that is not offered', () => {
    const result = paymentSchema.safeParse({ sameAsDelivery: true, paymentMethod: 'cash' })
    expect(result.success).toBe(false)
  })

  it('labels every offered method', () => {
    for (const id of PAYMENT_METHOD_IDS) {
      expect(getPaymentMethodLabel(id)).toBeTruthy()
    }
    expect(getPaymentMethodLabel('cash')).toBeNull()
  })

  it('collects no payment credential of any kind', () => {
    // The schema is the contract. If a card, expiry, CVV, UPI, or bank field
    // is ever added to it, this fails — which is the point.
    const forbidden = /card|cvv|cvc|expiry|upi|bank|account|ifsc|pin(?!Code)/i
    const fields = Object.keys(addressSchema.shape).concat(
      Object.keys(deliverySchema.shape),
      ['sameAsDelivery', 'billingAddress', 'paymentMethod'],
    )
    for (const field of fields) {
      expect(forbidden.test(field), field).toBe(false)
    }
  })
})

describe('resolveBillingAddress', () => {
  const delivery = deliverySchema.parse(validDelivery)

  it('derives billing from the current delivery address when same-as-delivery', () => {
    const resolved = resolveBillingAddress({
      delivery,
      billing: { sameAsDelivery: true, billingAddress: null },
    })
    expect(resolved).toMatchObject({
      firstName: 'Ananya',
      city: 'Bengaluru',
      postalCode: '560034',
    })
  })

  it('never carries contact details into the billing address', () => {
    const resolved = resolveBillingAddress({ delivery, billing: { sameAsDelivery: true } })
    expect(resolved).not.toHaveProperty('email')
    expect(resolved).not.toHaveProperty('phone')
  })

  it('follows a later edit to delivery instead of keeping a stale copy', () => {
    const billing = { sameAsDelivery: true, billingAddress: null }
    const before = resolveBillingAddress({ delivery, billing })
    expect(before.city).toBe('Bengaluru')

    const edited = { ...delivery, city: 'Pune', state: 'Maharashtra', postalCode: '411001' }
    const after = resolveBillingAddress({ delivery: edited, billing })
    expect(after.city).toBe('Pune')
    expect(after.postalCode).toBe('411001')
  })

  it('keeps an alternate billing address when one was entered', () => {
    const alternate = { ...validAddress, city: 'Chennai', state: 'Tamil Nadu' }
    const resolved = resolveBillingAddress({
      delivery,
      billing: { sameAsDelivery: false, billingAddress: alternate },
    })
    expect(resolved.city).toBe('Chennai')
  })

  it('returns null without a delivery address', () => {
    expect(resolveBillingAddress({ delivery: null, billing: null })).toBeNull()
  })
})
