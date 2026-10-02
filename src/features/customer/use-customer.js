import { useContext } from 'react'

import { CustomerContext } from '@/features/customer/customer-context'

/**
 * Access the session-only customer previews.
 *
 * Must be called inside `CustomerProvider` (mounted in `src/app/providers.jsx`).
 */
export function useCustomer() {
  const context = useContext(CustomerContext)
  if (!context) throw new Error('useCustomer must be used within a CustomerProvider')
  return context
}
