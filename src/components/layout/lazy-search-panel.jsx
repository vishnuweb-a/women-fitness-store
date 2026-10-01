import { lazy, Suspense, useState } from 'react'

/**
 * The search panel, loaded on demand.
 *
 * Search queries the full catalog, so importing it from the header would pull
 * the generated catalog into the initial load of **every** route — including
 * the cart, the account page, and checkout, none of which show a product. The
 * header renders on every page, so that import was the single biggest reason
 * route-level splitting alone moved almost nothing.
 *
 * Loading it lazily means the catalog chunk is fetched when it is first
 * needed: on the homepage and the collection routes it is already required for
 * the page itself, so nothing is delayed; elsewhere it is fetched only if the
 * person actually opens search.
 *
 * The panel stays mounted after its first open, so re-opening search never
 * waits on the network a second time.
 */
const SearchPanel = lazy(() =>
  import('@/components/layout/search-panel').then((m) => ({ default: m.SearchPanel })),
)

export function LazySearchPanel({ open, onOpenChange }) {
  // Latch on the first open and stay mounted afterwards: the chunk is already
  // fetched, and the dialog's own open/closed transition stays intact across
  // re-opens.
  //
  // `setState` during render is the supported way to derive state from a prop
  // (React calls it "adjusting state while rendering"): the update is applied
  // before the component's output is committed, so there is no second pass
  // over the tree and no flash of the wrong UI.
  const [everOpened, setEverOpened] = useState(open)
  if (open && !everOpened) setEverOpened(true)

  if (!everOpened) return null

  return (
    <Suspense fallback={null}>
      <SearchPanel open={open} onOpenChange={onOpenChange} />
    </Suspense>
  )
}
