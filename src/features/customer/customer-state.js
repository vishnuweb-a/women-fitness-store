/**
 * Pure state machine behind the session-only customer preview.
 *
 * Kept free of React so every rule below is testable on its own: the profile
 * reducer, the address reducer, and — the rule that is easiest to get wrong —
 * the invariant that exactly one address is the default whenever any address
 * exists, including after the default itself is deleted.
 *
 * ## Privacy
 *
 * Everything here lives in memory for the lifetime of one page session, on
 * exactly the same terms as the checkout draft in `checkout-state.js`. A name,
 * email, phone number, or address entered on the customer pages is **never**
 * written to `localStorage`, `sessionStorage`, a cookie, the URL, a log, the
 * cart storage, or Supabase. A reload deliberately clears it — that is the
 * privacy property, not a bug, and every customer screen says so.
 *
 * ## Why this is not the checkout draft
 *
 * The customer profile and the checkout draft are deliberately separate
 * stores. Checkout asks for the details of one delivery; the customer pages
 * preview what an account would hold. Wiring one into the other would mean a
 * value typed in a preview silently became the address a demo checkout ran
 * against — a copy nobody asked for. Nothing here is read by checkout, and
 * nothing in checkout writes here.
 */

export const initialCustomerState = {
  /** `{ firstName, lastName, email, phone }`, or null before anything is applied. */
  profile: null,
  /** Address previews, each `{ id, label, address, isDefault }`. */
  addresses: [],
}

/** Blank profile values for the edit form. */
export const emptyProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

/**
 * Address labels offered in the form.
 *
 * `custom` opens a free-text field rather than silently inventing a name, so
 * the label is always something the person chose.
 */
export const ADDRESS_LABEL_PRESETS = ['Home', 'Work']

export function customerReducer(state, action) {
  switch (action.type) {
    /** Replace the profile preview. Passing null clears it. */
    case 'set-profile':
      return { ...state, profile: action.profile ?? null }

    case 'clear-profile':
      return { ...state, profile: null }

    /**
     * Add an address preview.
     *
     * The first address added is always the default — an address list with no
     * default would leave the "default preview address" control showing
     * nothing selected, which is a state the UI should never have to render.
     */
    case 'add-address': {
      const isFirst = state.addresses.length === 0
      const makeDefault = isFirst || action.makeDefault === true
      const entry = {
        id: action.id,
        label: action.label,
        address: action.address,
        isDefault: makeDefault,
      }
      return {
        ...state,
        addresses: makeDefault
          ? [...state.addresses.map(undefaulted), entry]
          : [...state.addresses, entry],
      }
    }

    /** Replace one address's label and fields, leaving default status alone. */
    case 'update-address': {
      if (!state.addresses.some((entry) => entry.id === action.id)) return state
      return {
        ...state,
        addresses: state.addresses.map((entry) =>
          entry.id === action.id
            ? { ...entry, label: action.label, address: action.address }
            : entry,
        ),
      }
    }

    /**
     * Delete an address, then restore the one-default invariant.
     *
     * Deleting the default is the case that matters: without the repair below
     * the list would be left with addresses and no default at all. The first
     * remaining entry is promoted, which is stable and predictable — there is
     * no "most recently used" signal here to do anything cleverer with.
     */
    case 'remove-address': {
      const remaining = state.addresses.filter((entry) => entry.id !== action.id)
      if (remaining.length === state.addresses.length) return state
      return { ...state, addresses: ensureOneDefault(remaining) }
    }

    /** Choose the default preview address. Unknown ids are ignored. */
    case 'set-default-address': {
      if (!state.addresses.some((entry) => entry.id === action.id)) return state
      return {
        ...state,
        addresses: state.addresses.map((entry) => ({
          ...entry,
          isDefault: entry.id === action.id,
        })),
      }
    }

    /** Clear every session-only customer value at once. */
    case 'reset':
      return initialCustomerState

    default:
      return state
  }
}

function undefaulted(entry) {
  return entry.isDefault ? { ...entry, isDefault: false } : entry
}

/**
 * Guarantee exactly one default across a list of addresses.
 *
 * An empty list has no default, which is correct. A non-empty list keeps the
 * first entry already marked default, or promotes its first entry when none
 * is marked — and clears any duplicate marks, so "exactly one" holds in both
 * directions rather than only "at least one".
 */
export function ensureOneDefault(addresses) {
  if (addresses.length === 0) return []
  const currentDefault = addresses.find((entry) => entry.isDefault)
  const defaultId = currentDefault ? currentDefault.id : addresses[0].id
  return addresses.map((entry) => ({ ...entry, isDefault: entry.id === defaultId }))
}

/** The default address preview, or null when there are none. */
export function getDefaultAddress(addresses) {
  return addresses.find((entry) => entry.isDefault) ?? null
}

/**
 * A stable id for an address preview.
 *
 * `crypto.randomUUID` where available, with the same fallback shape the demo
 * reference generator uses. These ids never leave memory.
 */
export function createAddressId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `addr-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

/** The display name for a profile preview, or null when neither name is set. */
export function profileDisplayName(profile) {
  if (!profile) return null
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
  return name || null
}
