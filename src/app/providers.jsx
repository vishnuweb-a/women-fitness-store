import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { ErrorBoundary } from '@/components/shared/error-boundary'
import { StoreProvider } from '@/features/cart/cart-store'
import { createQueryClient } from '@/lib/query-client'

/**
 * Application-wide providers.
 *
 * The query client is created in state so each mount gets exactly one
 * instance — creating it during render would discard the cache on every
 * re-render.
 */
export function AppProviders({ children }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>{children}</StoreProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
