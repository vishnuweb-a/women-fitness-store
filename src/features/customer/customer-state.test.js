/**
 * Tests for the session-only customer state.
 *
 * The rule that gets most of the attention here is the one-default
 * invariant: whenever any address exists, exactly one is marked default. It
 * is easy to satisfy in the happy path and easy to break by deleting the
 * default, which is why deletion is covered from several directions rather
 * than once.
 */
import { describe, expect, it } from 'vitest'

import {
  customerReducer,
  ensureOneDefault,
  getDefaultAddress,
  initialCustomerState,
  profileDisplayName,
} from '@/features/customer/customer-state'

/** Apply a sequence of actions to the initial state. */
function run(actions, state = initialCustomerState) {
  return actions.reduce(customerReducer, state)
}

const addressFor = (city) => ({
  firstName: 'Asha',
  lastName: 'Rao',
  addressLine1: '12 Residency Road',
  addressLine2: '',
  city,
  state: 'Karnataka',
  postalCode: '560025',
  country: 'India',
})

const add = (id, label, city = 'Bengaluru', makeDefault = false) => ({
  type: 'add-address',
  id,
  label,
  address: addressFor(city),
  makeDefault,
})

/** Exactly one default across a list — the invariant, asserted directly. */
function defaultCount(addresses) {
  return addresses.filter((entry) => entry.isDefault).length
}

describe('customerReducer — profile', () => {
  it('starts with no profile', () => {
    expect(initialCustomerState.profile).toBeNull()
  })

  it('stores an applied profile', () => {
    const profile = {
      firstName: 'Asha',
      lastName: 'Rao',
      email: 'asha@example.com',
      phone: '9876543210',
    }
    const state = run([{ type: 'set-profile', profile }])
    expect(state.profile).toEqual(profile)
  })

  it('replaces the profile rather than merging into it', () => {
    const first = { firstName: 'Asha', lastName: 'Rao', email: 'a@example.com', phone: '9876543210' }
    const second = { firstName: 'Meera', lastName: 'Nair', email: 'm@example.com', phone: '9812345678' }
    const state = run([
      { type: 'set-profile', profile: first },
      { type: 'set-profile', profile: second },
    ])
    expect(state.profile).toEqual(second)
  })

  it('clears the profile', () => {
    const state = run([
      { type: 'set-profile', profile: { firstName: 'Asha', lastName: 'Rao', email: 'a@e.com', phone: '9876543210' } },
      { type: 'clear-profile' },
    ])
    expect(state.profile).toBeNull()
  })

  it('treats a null profile as cleared', () => {
    const state = run([{ type: 'set-profile', profile: null }])
    expect(state.profile).toBeNull()
  })
})

describe('customerReducer — addresses', () => {
  it('starts with no addresses and no default', () => {
    expect(initialCustomerState.addresses).toEqual([])
    expect(getDefaultAddress(initialCustomerState.addresses)).toBeNull()
  })

  it('makes the first address the default automatically', () => {
    const state = run([add('a', 'Home')])
    expect(state.addresses).toHaveLength(1)
    expect(state.addresses[0].isDefault).toBe(true)
    expect(getDefaultAddress(state.addresses).id).toBe('a')
  })

  it('does not make a later address default unless asked', () => {
    const state = run([add('a', 'Home'), add('b', 'Work')])
    expect(defaultCount(state.addresses)).toBe(1)
    expect(getDefaultAddress(state.addresses).id).toBe('a')
  })

  it('moves the default when a later address asks for it', () => {
    const state = run([add('a', 'Home'), add('b', 'Work', 'Pune', true)])
    expect(defaultCount(state.addresses)).toBe(1)
    expect(getDefaultAddress(state.addresses).id).toBe('b')
  })

  it('switches the default on request', () => {
    const state = run([add('a', 'Home'), add('b', 'Work'), { type: 'set-default-address', id: 'b' }])
    expect(defaultCount(state.addresses)).toBe(1)
    expect(getDefaultAddress(state.addresses).id).toBe('b')
  })

  it('ignores a default request for an unknown id', () => {
    const before = run([add('a', 'Home')])
    const after = customerReducer(before, { type: 'set-default-address', id: 'nope' })
    expect(after).toBe(before)
    expect(getDefaultAddress(after.addresses).id).toBe('a')
  })

  it('updates an address without disturbing its default status', () => {
    const state = run([
      add('a', 'Home'),
      add('b', 'Work'),
      { type: 'update-address', id: 'a', label: 'Parents', address: addressFor('Mysuru') },
    ])
    const updated = state.addresses.find((entry) => entry.id === 'a')
    expect(updated.label).toBe('Parents')
    expect(updated.address.city).toBe('Mysuru')
    expect(updated.isDefault).toBe(true)
    expect(defaultCount(state.addresses)).toBe(1)
  })

  it('ignores an update for an unknown id', () => {
    const before = run([add('a', 'Home')])
    const after = customerReducer(before, {
      type: 'update-address',
      id: 'nope',
      label: 'X',
      address: addressFor('Delhi'),
    })
    expect(after).toBe(before)
  })
})

describe('customerReducer — deleting an address', () => {
  it('removes a non-default address and leaves the default alone', () => {
    const state = run([add('a', 'Home'), add('b', 'Work'), { type: 'remove-address', id: 'b' }])
    expect(state.addresses).toHaveLength(1)
    expect(getDefaultAddress(state.addresses).id).toBe('a')
  })

  /**
   * The case this whole invariant exists for. Deleting the default must
   * promote another address, not leave a list with no default at all.
   */
  it('promotes another address when the default is deleted', () => {
    const state = run([add('a', 'Home'), add('b', 'Work'), { type: 'remove-address', id: 'a' }])
    expect(state.addresses).toHaveLength(1)
    expect(defaultCount(state.addresses)).toBe(1)
    expect(getDefaultAddress(state.addresses).id).toBe('b')
  })

  it('keeps exactly one default after deleting the default from a longer list', () => {
    const state = run([
      add('a', 'Home'),
      add('b', 'Work'),
      add('c', 'Gym'),
      { type: 'set-default-address', id: 'b' },
      { type: 'remove-address', id: 'b' },
    ])
    expect(state.addresses.map((entry) => entry.id)).toEqual(['a', 'c'])
    expect(defaultCount(state.addresses)).toBe(1)
    expect(getDefaultAddress(state.addresses).id).toBe('a')
  })

  it('leaves no default when the last address is deleted', () => {
    const state = run([add('a', 'Home'), { type: 'remove-address', id: 'a' }])
    expect(state.addresses).toEqual([])
    expect(getDefaultAddress(state.addresses)).toBeNull()
  })

  it('deleting every address one at a time never leaves a list without a default', () => {
    let state = run([add('a', 'Home'), add('b', 'Work'), add('c', 'Gym')])

    for (const id of ['a', 'b', 'c']) {
      state = customerReducer(state, { type: 'remove-address', id })
      // The invariant, checked after each step rather than only at the end.
      expect(defaultCount(state.addresses)).toBe(state.addresses.length === 0 ? 0 : 1)
    }

    expect(state.addresses).toEqual([])
  })

  it('ignores a delete for an unknown id', () => {
    const before = run([add('a', 'Home')])
    const after = customerReducer(before, { type: 'remove-address', id: 'nope' })
    expect(after).toBe(before)
  })
})

describe('ensureOneDefault', () => {
  it('returns an empty list unchanged', () => {
    expect(ensureOneDefault([])).toEqual([])
  })

  it('promotes the first entry when none is marked', () => {
    const result = ensureOneDefault([
      { id: 'a', isDefault: false },
      { id: 'b', isDefault: false },
    ])
    expect(result.map((entry) => entry.isDefault)).toEqual([true, false])
  })

  it('collapses duplicate defaults to the first of them', () => {
    const result = ensureOneDefault([
      { id: 'a', isDefault: false },
      { id: 'b', isDefault: true },
      { id: 'c', isDefault: true },
    ])
    expect(result.filter((entry) => entry.isDefault).map((entry) => entry.id)).toEqual(['b'])
  })

  it('keeps an existing single default', () => {
    const result = ensureOneDefault([
      { id: 'a', isDefault: false },
      { id: 'b', isDefault: true },
    ])
    expect(result.find((entry) => entry.isDefault).id).toBe('b')
  })
})

describe('customer state reset', () => {
  it('clears the profile and every address at once', () => {
    const populated = run([
      {
        type: 'set-profile',
        profile: { firstName: 'Asha', lastName: 'Rao', email: 'a@e.com', phone: '9876543210' },
      },
      add('a', 'Home'),
      add('b', 'Work'),
    ])
    expect(populated.profile).not.toBeNull()
    expect(populated.addresses).toHaveLength(2)

    const reset = customerReducer(populated, { type: 'reset' })
    expect(reset).toEqual(initialCustomerState)
    expect(reset.profile).toBeNull()
    expect(reset.addresses).toEqual([])
  })

  /**
   * The reset must be total. A field added to the state later and forgotten
   * here would be a personal value surviving a reset, so the whole object is
   * compared rather than the two fields the test happens to know about.
   */
  it('returns state deeply equal to the initial state', () => {
    const populated = run([add('a', 'Home')])
    expect(customerReducer(populated, { type: 'reset' })).toEqual(initialCustomerState)
  })

  it('ignores an unknown action', () => {
    const before = run([add('a', 'Home')])
    expect(customerReducer(before, { type: 'not-a-real-action' })).toBe(before)
  })
})

describe('profileDisplayName', () => {
  it('returns null for no profile', () => {
    expect(profileDisplayName(null)).toBeNull()
  })

  it('joins both names', () => {
    expect(profileDisplayName({ firstName: 'Asha', lastName: 'Rao' })).toBe('Asha Rao')
  })

  it('returns null when both names are blank', () => {
    expect(profileDisplayName({ firstName: '', lastName: '' })).toBeNull()
  })
})
