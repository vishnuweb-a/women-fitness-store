/**
 * In-memory state for the customer previews.
 *
 * Mounted above the router in `providers.jsx`, so a profile or address
 * preview survives navigation between the customer pages without ever
 * touching persistent storage.
 *
 * **Nothing here is persisted.** No `localStorage`, no `sessionStorage`, no
 * URL parameter, no cookie, no analytics call, no `console` output carries a
 * name, email, phone number, or address. A reload clears it on purpose, and
 * every customer screen states that rather than implying a saved account.
 *
 * The wishlist is the deliberate exception and does not live here: it holds
 * product ids, not personal details, and it is already persisted by
 * `StoreProvider`.
 */
import { useCallback, useMemo, useReducer } from 'react'

import { CustomerContext } from '@/features/customer/customer-context'
import {
  createAddressId,
  customerReducer,
  getDefaultAddress,
  initialCustomerState,
} from '@/features/customer/customer-state'

export function CustomerProvider({ children }) {
  const [state, dispatch] = useReducer(customerReducer, initialCustomerState)

  const setProfile = useCallback((profile) => {
    dispatch({ type: 'set-profile', profile })
  }, [])

  const clearProfile = useCallback(() => dispatch({ type: 'clear-profile' }), [])

  /** Add an address preview and return the id it was given. */
  const addAddress = useCallback(({ label, address, makeDefault = false }) => {
    const id = createAddressId()
    dispatch({ type: 'add-address', id, label, address, makeDefault })
    return id
  }, [])

  const updateAddress = useCallback((id, { label, address }) => {
    dispatch({ type: 'update-address', id, label, address })
  }, [])

  const removeAddress = useCallback((id) => {
    dispatch({ type: 'remove-address', id })
  }, [])

  const setDefaultAddress = useCallback((id) => {
    dispatch({ type: 'set-default-address', id })
  }, [])

  /** Clear every session-only customer value at once. */
  const resetCustomer = useCallback(() => dispatch({ type: 'reset' }), [])

  const value = useMemo(
    () => ({
      profile: state.profile,
      addresses: state.addresses,
      defaultAddress: getDefaultAddress(state.addresses),
      hasCustomerData: state.profile !== null || state.addresses.length > 0,
      setProfile,
      clearProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      resetCustomer,
    }),
    [
      state.profile,
      state.addresses,
      setProfile,
      clearProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      resetCustomer,
    ],
  )

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}
