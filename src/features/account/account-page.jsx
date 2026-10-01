import { PageShell, PhasePlaceholder } from '@/components/shared/page-shell'

export function AccountPage() {
  return (
    <PageShell
      title="Your account"
      description="Profile, addresses, and order history."
    >
      <PhasePlaceholder>
        Authentication is not wired up yet. Sign-in, profile, and order history
        are built in a later phase.
      </PhasePlaceholder>
    </PageShell>
  )
}
