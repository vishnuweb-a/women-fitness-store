/**
 * The customer hub.
 *
 * Replaces the Phase 0 `/account` placeholder. It is **not** an account
 * dashboard, and it does not pretend to be one: there is no authentication in
 * this build, so there is no identity to greet, no membership to display, no
 * reward balance to total, and no lifetime order count to report. Inventing
 * any of those would be fabricating a relationship with a person the
 * application has never met.
 *
 * What it does show is a route into each preview, and an honest line about
 * what that preview holds right now — "Not set in this session" rather than a
 * plausible-looking placeholder name.
 */
import { ArrowRight, Heart, LifeBuoy, MapPin, Receipt, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useStore } from '@/features/cart/use-store'
import { useCheckout } from '@/features/checkout/use-checkout'
import { CustomerLayout } from '@/features/customer/customer-layout'
import { useCustomer } from '@/features/customer/use-customer'
import { profileDisplayName } from '@/features/customer/customer-state'

/** One hub card: a section, what it currently holds, and a route into it. */
function HubCard({ icon: Icon, title, to, linkLabel, status, children }) {
  const headingId = `hub-${to.replace(/\W+/g, '-')}`

  return (
    <li>
      <section
        aria-labelledby={headingId}
        className="flex h-full flex-col rounded-card border border-border p-5"
      >
        <h2 id={headingId} className="flex items-center gap-2 text-base font-semibold">
          <Icon className="size-4 shrink-0 text-brand-600" aria-hidden="true" focusable="false" />
          {title}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground text-pretty">{children}</p>

        {status && (
          <p className="mt-3 text-sm font-medium text-ink-900 text-pretty">{status}</p>
        )}

        <Button
          asChild
          variant="outline"
          size="lg"
          className="mt-auto w-full self-start sm:w-auto"
        >
          <Link to={to}>
            {linkLabel}
            <ArrowRight className="size-4" aria-hidden="true" focusable="false" />
          </Link>
        </Button>
      </section>
    </li>
  )
}

export function CustomerHubPage() {
  const { profile, addresses } = useCustomer()
  const { wishlistCount } = useStore()
  const { state } = useCheckout()

  // Demo orders come from the one real source: the checkout provider's frozen
  // snapshots. No second order store exists, and none is invented here.
  const demoOrderCount = Object.keys(state.completed).length
  const name = profileDisplayName(profile)

  return (
    <CustomerLayout
      title="Customer hub"
      description="Preview the customer areas of the storefront: profile, addresses, demo order records, your saved products, and help."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        <HubCard
          icon={UserRound}
          title="Profile preview"
          to="/account/profile"
          linkLabel="Open profile preview"
          status={name ? `Previewing as ${name}` : 'Not set in this session'}
        >
          Try the name, email, and phone fields an account would hold. Values stay
          in memory for this session.
        </HubCard>

        <HubCard
          icon={MapPin}
          title="Address preview"
          to="/account/addresses"
          linkLabel="Open address preview"
          status={
            addresses.length === 0
              ? 'No addresses in this session'
              : `${addresses.length} ${addresses.length === 1 ? 'address' : 'addresses'} in this session`
          }
        >
          Add, edit, and remove address previews, and choose which one is marked
          default. Reloading clears them.
        </HubCard>

        <HubCard
          icon={Receipt}
          title="Demo orders"
          to="/account/orders"
          linkLabel="Open demo orders"
          status={
            demoOrderCount === 0
              ? 'No demo checkouts completed in this session'
              : `${demoOrderCount} demo ${demoOrderCount === 1 ? 'checkout' : 'checkouts'} in this session`
          }
        >
          Demo checkout snapshots completed in this browser tab. No real order
          exists, because checkout takes no payment.
        </HubCard>

        <HubCard
          icon={Heart}
          title="Wishlist"
          to="/wishlist"
          linkLabel="Open wishlist"
          status={
            wishlistCount === 0
              ? 'No saved products'
              : `${wishlistCount} saved ${wishlistCount === 1 ? 'product' : 'products'}`
          }
        >
          Products you have saved. Unlike everything else here, the wishlist is
          stored in this browser and survives a reload.
        </HubCard>

        <HubCard
          icon={LifeBuoy}
          title="Help and support"
          to="/help"
          linkLabel="Open help"
        >
          What this storefront can and cannot do, how to contact us, and the
          current status of the shipping, returns, privacy, and terms pages.
        </HubCard>
      </ul>

      <section
        aria-labelledby="hub-what-exists"
        className="mt-8 rounded-card border border-border bg-muted/60 p-5"
      >
        <h2 id="hub-what-exists" className="text-sm font-semibold uppercase tracking-wide">
          What is connected
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-ink-900">Saved in this browser</dt>
            <dd className="text-muted-foreground text-pretty">
              Your wishlist and your shopping bag. Both are local to this browser
              and are not synced to any account.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink-900">Session only, cleared on reload</dt>
            <dd className="text-muted-foreground text-pretty">
              Profile and address previews, and any demo checkout record. These are
              held in memory and never written to storage.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink-900">Not built</dt>
            <dd className="text-muted-foreground text-pretty">
              Sign-in, accounts, and server-side storage. There is no way to sign
              in, because no authentication exists in this build.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink-900">Demonstration only</dt>
            <dd className="text-muted-foreground text-pretty">
              Checkout. It validates and renders the screens, but takes no payment
              and places no order.
            </dd>
          </div>
        </dl>
      </section>
    </CustomerLayout>
  )
}
