import { PageShell, PhasePlaceholder } from '@/components/shared/page-shell'

export function CheckoutPage() {
  return (
    <PageShell
      title="Checkout"
      description="Delivery information step."
    >
      <PhasePlaceholder>
        Checkout is not operational. No order can be placed and no payment can
        be taken. The delivery form, address validation, and order creation are
        built in a later phase.
      </PhasePlaceholder>
    </PageShell>
  )
}
