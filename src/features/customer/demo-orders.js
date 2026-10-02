/**
 * Reading the demo checkout snapshots.
 *
 * Kept out of `demo-orders-page.jsx` so that file exports only components and
 * Fast Refresh keeps working, and so the ordering rule can be tested without
 * rendering anything.
 *
 * The snapshots themselves belong to `CheckoutProvider`. Nothing here copies,
 * caches, or mutates them — there is exactly one order store in this project
 * and this is a read of it.
 */
/**
 * Snapshots, newest first.
 *
 * Sorted by the recorded `createdAt` rather than by insertion order, so the
 * list does not depend on how the object's keys happen to be enumerated.
 */
export function listDemoSnapshots(completed) {
  return Object.values(completed ?? {}).sort((a, b) =>
    String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
  )
}
