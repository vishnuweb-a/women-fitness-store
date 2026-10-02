import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { ErrorBoundary } from '@/components/shared/error-boundary'
import { StoreProvider } from '@/features/cart/cart-store'
import { CheckoutProvider } from '@/features/checkout/checkout-provider'
import { CustomerProvider } from '@/features/customer/customer-provider'
import { createQueryClient } from '@/lib/query-client'

/**
 * Application-wide providers.
 *
 * The query client is created in state so each mount gets exactly one
 * instance — creating it during render would discard the cache on every
 * re-render.
 *
 * `CheckoutProvider` sits inside `StoreProvider` because the checkout draft is
 * read alongside the live cart, and above the router so the draft survives
 * navigation between checkout steps. It holds contact and address values **in
 * memory only** — see `checkout-provider.jsx`.
 *
 * `CustomerProvider` sits inside `CheckoutProvider` because the customer
 * pages read the completed demo snapshots the checkout holds, rather than
 * keeping a second copy of them. It holds profile and address previews **in
 * memory only** — see `customer-provider.jsx`.
 */
export function AppProviders({ children }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <CheckoutProvider>
            <CustomerProvider>{children}</CustomerProvider>
          </CheckoutProvider>
        </StoreProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
