import { QueryClient } from '@tanstack/react-query'

/**
 * Shared TanStack Query configuration.
 *
 * Catalog data changes rarely, so a one-minute stale window avoids refetching
 * on every mount while keeping prices and stock reasonably fresh.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
