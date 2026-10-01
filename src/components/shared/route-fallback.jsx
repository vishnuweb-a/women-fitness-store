/**
 * Placeholder shown while a lazily-loaded route chunk is fetched.
 *
 * Deliberately quiet: a route chunk is a few kilobytes on a warm connection,
 * and a spinner that flashes for 40ms is worse than a stable block of space.
 * The skeleton reserves roughly a page's worth of height so the footer does
 * not jump up and then back down as the chunk arrives.
 *
 * `role="status"` with a visually hidden message means the wait is announced
 * once, without a visible "Loading…" that would flash on fast connections.
 */
export function RouteFallback() {
  return (
    <div className="container-site py-section" role="status" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <div className="h-6 w-40 animate-pulse rounded-control bg-muted" />
      <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-control bg-muted" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="aspect-[3/4] animate-pulse rounded-card bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
