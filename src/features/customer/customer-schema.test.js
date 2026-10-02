/**
 * Tests for the customer preview validation.
 *
 * These assert two kinds of thing: that the rules reject what they should,
 * and — the part that matters for privacy — that the schema collects no
 * sensitive field. A password or date-of-birth key appearing in the parsed
 * output would mean the form had started gathering a credential, and the
 * test below fails if one is ever added.
 */
import { describe, expect, it } from 'vitest'

import {
  addressPreviewSchema,
  emptyAddressPreview,
  profileSchema,
  resolveAddressLabel,
} from '@/features/customer/customer-schema'

const validProfile = {
  firstName: 'Asha',
  lastName: 'Rao',
  email: 'asha@example.com',
  phone: '9876543210',
}

describe('profileSchema', () => {
  it('accepts a complete profile', () => {
    const result = profileSchema.safeParse(validProfile)
    expect(result.success).toBe(true)
  })

  it('normalises the phone number to ten digits', () => {
    const result = profileSchema.parse({ ...validProfile, phone: '+91 98765-43210' })
    expect(result.phone).toBe('9876543210')
  })

  it('trims surrounding whitespace', () => {
    const result = profileSchema.parse({
      ...validProfile,
      firstName: '  Asha  ',
      email: '  asha@example.com  ',
    })
    expect(result.firstName).toBe('Asha')
    expect(result.email).toBe('asha@example.com')
  })

  it('rejects a name of only spaces', () => {
    const result = profileSchema.safeParse({ ...validProfile, firstName: '   ' })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toBe('Enter a first name.')
  })

  it.each([
    ['empty', ''],
    ['no at-sign', 'ashaexample.com'],
    ['no domain', 'asha@'],
    ['spaces', 'asha rao@example.com'],
  ])('rejects an invalid email (%s)', (_label, email) => {
    expect(profileSchema.safeParse({ ...validProfile, email }).success).toBe(false)
  })

  it.each([
    ['too short', '98765'],
    ['too long', '98765432101'],
    ['starts with 5', '5876543210'],
    ['letters', 'not-a-number'],
    ['empty', ''],
  ])('rejects an invalid phone number (%s)', (_label, phone) => {
    expect(profileSchema.safeParse({ ...validProfile, phone }).success).toBe(false)
  })

  it('reports every invalid field at once rather than stopping at the first', () => {
    const result = profileSchema.safeParse({
      firstName: '',
      lastName: '',
      email: 'nope',
      phone: '123',
    })
    expect(result.success).toBe(false)
    const paths = result.error.issues.map((issue) => issue.path[0])
    expect(new Set(paths)).toEqual(new Set(['firstName', 'lastName', 'email', 'phone']))
  })

  /**
   * The privacy guard. The profile preview exists to demonstrate a form, not
   * to collect anything that would matter if it leaked — and there is no
   * account to secure, so a password field would be gathering a reused
   * secret for no purpose at all.
   */
  it('collects no password, birth date, or other sensitive field', () => {
    const parsed = profileSchema.parse(validProfile)
    expect(Object.keys(parsed).sort()).toEqual(['email', 'firstName', 'lastName', 'phone'])
  })

  it('strips any sensitive field that is passed in anyway', () => {
    const parsed = profileSchema.parse({
      ...validProfile,
      password: 'hunter2',
      dateOfBirth: '1990-01-01',
    })
    expect(parsed).not.toHaveProperty('password')
    expect(parsed).not.toHaveProperty('dateOfBirth')
  })
})

const validAddress = {
  ...emptyAddressPreview,
  labelKind: 'Home',
  firstName: 'Asha',
  lastName: 'Rao',
  addressLine1: '12 Residency Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560025',
}

describe('addressPreviewSchema', () => {
  it('accepts a complete address with a preset label', () => {
    expect(addressPreviewSchema.safeParse(validAddress).success).toBe(true)
  })

  it('reuses the checkout PIN-code rule', () => {
    expect(
      addressPreviewSchema.safeParse({ ...validAddress, postalCode: '12345' }).success,
    ).toBe(false)
    expect(
      addressPreviewSchema.safeParse({ ...validAddress, postalCode: '060025' }).success,
    ).toBe(false)
  })

  it('requires a state', () => {
    const result = addressPreviewSchema.safeParse({ ...validAddress, state: '' })
    expect(result.success).toBe(false)
  })

  it('requires a custom label when the label kind is custom', () => {
    const result = addressPreviewSchema.safeParse({
      ...validAddress,
      labelKind: 'custom',
      customLabel: '',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((issue) => issue.path[0] === 'customLabel')).toBe(true)
  })

  it('accepts a custom label when one is given', () => {
    expect(
      addressPreviewSchema.safeParse({
        ...validAddress,
        labelKind: 'custom',
        customLabel: 'Studio',
      }).success,
    ).toBe(true)
  })

  /**
   * The trap Phase 3's billing form fell into: a value left behind in a field
   * that is no longer shown must not block the form.
   */
  it('ignores a leftover custom label when a preset is chosen', () => {
    const result = addressPreviewSchema.safeParse({
      ...validAddress,
      labelKind: 'Work',
      customLabel: 'abandoned value',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown label kind', () => {
    expect(
      addressPreviewSchema.safeParse({ ...validAddress, labelKind: 'Warehouse' }).success,
    ).toBe(false)
  })
})

describe('resolveAddressLabel', () => {
  it('uses the preset directly', () => {
    expect(resolveAddressLabel({ labelKind: 'Home', customLabel: 'ignored' })).toBe('Home')
  })

  it('uses the trimmed custom label', () => {
    expect(resolveAddressLabel({ labelKind: 'custom', customLabel: '  Studio  ' })).toBe('Studio')
  })
})
