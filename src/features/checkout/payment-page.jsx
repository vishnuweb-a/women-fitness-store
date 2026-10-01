import { PageShell, PhasePlaceholder } from '@/components/shared/page-shell'

export function PaymentPage() {
  return (
    <PageShell title="Payment" description="Billing and payment step.">
      <PhasePlaceholder>
        Payment is not operational. No payment provider is integrated and no
        card or UPI details are collected or transmitted anywhere.
      </PhasePlaceholder>
    </PageShell>
  )
}
