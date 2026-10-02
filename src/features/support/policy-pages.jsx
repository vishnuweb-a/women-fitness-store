/**
 * Shipping, returns, privacy, and terms.
 *
 * ## The rule these four pages follow
 *
 * FITNEX has set no commercial or legal terms, and this build cannot ship,
 * refund, or charge anything. So none of these pages states a delivery area,
 * a fee, a timeframe, a return window, a guarantee, or a refund rule — each
 * would be a commitment a customer could reasonably rely on, invented by the
 * people who built the frontend rather than decided by the merchant.
 *
 * Nor is another company's policy copied in as a placeholder. A real policy
 * borrowed from elsewhere reads as authoritative and binds the wrong party.
 *
 * What the privacy and terms pages do contain is a description of **observed
 * behaviour** — what this build actually stores, and which third parties
 * actually receive a request. That is verifiable, so it is stated plainly and
 * marked as a draft pending review rather than presented as a finished
 * policy.
 */
import { Link } from 'react-router-dom'

import { PolicyStatus, SupportLayout, SupportSection } from '@/features/support/support-layout'

/* -------------------------------------------------------------------------- */
/* Shipping                                                                   */
/* -------------------------------------------------------------------------- */

export function ShippingPage() {
  return (
    <SupportLayout
      title="Shipping"
      description="The delivery policy for FITNEX WOMEN has not been confirmed."
      status={
        <PolicyStatus tone="pending">
          No shipping policy has been set. Delivery areas, charges, timeframes, and
          carriers are all awaiting confirmation from the merchant, so none is stated
          on this page.
        </PolicyStatus>
      }
    >
      <SupportSection id="shipping-status" title="Why this page is empty of detail">
        <p>
          Nothing in this build can ship an order. Checkout is a frontend
          demonstration that takes no payment and creates no order, there is no
          warehouse or carrier integration, and no stock data exists for any product.
        </p>
        <p>
          Publishing delivery times, charges, or a coverage area under those
          conditions would be inventing commitments. The merchant has not set them,
          so this page does not state them.
        </p>
      </SupportSection>

      <SupportSection id="shipping-pending" title="What is awaiting confirmation">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Which regions can be delivered to, and which cannot.</li>
          <li>Delivery charges, and any threshold for free delivery.</li>
          <li>Dispatch and delivery timeframes.</li>
          <li>Carriers used, and whether tracking will be available.</li>
          <li>How serviceability is checked against a PIN code.</li>
        </ul>
      </SupportSection>

      <SupportSection id="shipping-now" title="What the storefront does today">
        <p>
          Checkout collects a delivery address and checks its <em>format</em> only —
          six digits for a PIN code, a state chosen from the official list. It does
          not check whether the address exists or whether delivery reaches it,
          because no coverage data exists here.
        </p>
        <p>
          The bag and the demo checkout show a merchandise subtotal and report
          shipping and taxes as “not calculated”, rather than displaying a zero or a
          free-delivery badge that nothing supports.
        </p>
      </SupportSection>
    </SupportLayout>
  )
}

/* -------------------------------------------------------------------------- */
/* Returns                                                                    */
/* -------------------------------------------------------------------------- */

export function ReturnsPage() {
  return (
    <SupportLayout
      title="Returns"
      description="The returns and refunds policy for FITNEX WOMEN has not been confirmed."
      status={
        <PolicyStatus tone="pending">
          No returns policy has been set. Return windows, eligibility, refund rules,
          and exchange terms are all awaiting confirmation from the merchant, so none
          is stated on this page.
        </PolicyStatus>
      }
    >
      <SupportSection id="returns-status" title="Why this page is empty of detail">
        <p>
          No order can be placed in this build, so no order can be returned. There is
          no payment provider to refund through, no order record to return against,
          and no returns process to describe.
        </p>
        <p>
          A return window or refund guarantee stated here would be a promise nobody
          at FITNEX has made, on a transaction that never happened.
        </p>
      </SupportSection>

      <SupportSection id="returns-pending" title="What is awaiting confirmation">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Whether returns are accepted, and within what period.</li>
          <li>Which products are eligible, and which are excluded.</li>
          <li>Condition and packaging requirements.</li>
          <li>Who pays return shipping.</li>
          <li>How and when a refund would be issued, and in what form.</li>
          <li>Whether exchanges are offered.</li>
        </ul>
      </SupportSection>

      <SupportSection id="returns-elsewhere" title="A note on what you may see elsewhere">
        <p>
          Promotional artwork used on this storefront, and the announcement strip at
          the top of the page, came from the original reference designs and may
          mention returns. Those are design placeholders, not a policy FITNEX has
          adopted. This page is the authoritative one, and it states that no policy
          has been set.
        </p>
      </SupportSection>
    </SupportLayout>
  )
}

/* -------------------------------------------------------------------------- */
/* Privacy                                                                    */
/* -------------------------------------------------------------------------- */

export function PrivacyPage() {
  return (
    <SupportLayout
      title="Privacy"
      description="A draft description of what this storefront stores and which third parties receive a request."
      status={
        <PolicyStatus tone="draft">
          This is a technical description of observed behaviour, not a finished
          privacy policy. It has not been reviewed by the merchant or by a lawyer, it
          names no legal entity or jurisdiction, and it should not be relied on as a
          legal document.
        </PolicyStatus>
      }
    >
      <SupportSection id="privacy-stored" title="What is stored in your browser">
        <p>
          Two values are written to this site's <code>localStorage</code>, and
          nothing else:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <code>fitnex:cart:v2</code> — your bag, as product identifiers, selected
            option labels, and quantities. No name or price is stored; those are read
            from the catalog each time the page renders.
          </li>
          <li>
            <code>fitnex:wishlist:v1</code> — your saved products, as a list of
            product identifiers.
          </li>
        </ul>
        <p>
          Both stay on this device, in this browser. They are not sent to a server,
          not linked to any identity, and can be cleared at any time through your
          browser's site-data controls.
        </p>
        <p>
          This storefront sets <strong>no cookies</strong>, and no analytics,
          advertising, or session-tracking script is loaded.
        </p>
      </SupportSection>

      <SupportSection id="privacy-memory" title="What is held in memory only">
        <p>
          Details entered in the demo checkout, on the{' '}
          <Link to="/account/profile" className="font-medium text-brand-600 hover:underline">
            profile preview
          </Link>
          , on the{' '}
          <Link to="/account/addresses" className="font-medium text-brand-600 hover:underline">
            address preview
          </Link>
          , and in the{' '}
          <Link to="/contact" className="font-medium text-brand-600 hover:underline">
            contact form
          </Link>{' '}
          are held in the page's memory for as long as the tab is open.
        </p>
        <p>
          They are not written to <code>localStorage</code>, <code>sessionStorage</code>,
          or a cookie, never appear in the address bar, and are not logged. Reloading
          the page clears them, which is deliberate rather than a limitation.
        </p>
      </SupportSection>

      <SupportSection id="privacy-third-parties" title="Third parties that receive a request">
        <p>
          Loading a page here causes your browser to make requests to the following,
          which means those services necessarily receive your IP address and standard
          request headers. It would be wrong to claim no data leaves your browser:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Cloudinary</strong> (<code>res.cloudinary.com</code>) — delivers
            every product image.
          </li>
          <li>
            <strong>Google Fonts</strong> (<code>fonts.googleapis.com</code> and{' '}
            <code>fonts.gstatic.com</code>) — delivers the two webfonts used by the
            site.
          </li>
          <li>
            Whoever hosts this site, which receives the request for the page itself.
          </li>
        </ul>
        <p>
          No personal detail you type is included in any of those requests. Each
          service's own handling of request data is governed by its own policies, not
          by this page.
        </p>
      </SupportSection>

      <SupportSection id="privacy-not-happening" title="What does not happen">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>No account is created, because there is no authentication.</li>
          <li>No payment detail is collected anywhere in the checkout flow.</li>
          <li>No order record is created or stored on any server.</li>
          <li>No newsletter subscription is recorded; the form says so when used.</li>
          <li>No contact message is transmitted; the form says so before you type.</li>
          <li>Nothing is written to a database. No database tables exist.</li>
        </ul>
      </SupportSection>

      <SupportSection id="privacy-pending" title="What a published policy would still need">
        <p>
          A real privacy policy needs the merchant's legal entity and address, the
          governing jurisdiction, a lawful basis for each kind of processing,
          retention periods, how to exercise data rights, and a contact route for
          doing so. None of those has been supplied, and none is invented here.
        </p>
      </SupportSection>
    </SupportLayout>
  )
}

/* -------------------------------------------------------------------------- */
/* Terms                                                                      */
/* -------------------------------------------------------------------------- */

export function TermsPage() {
  return (
    <SupportLayout
      title="Terms"
      description="A draft note on what using this demonstration storefront does and does not involve."
      status={
        <PolicyStatus tone="draft">
          These are draft notes about a demonstration site, not terms of sale or a
          contract. They have not been reviewed by the merchant or by a lawyer, they
          name no legal entity or jurisdiction, and no sale can take place here for
          them to govern.
        </PolicyStatus>
      }
    >
      <SupportSection id="terms-nature" title="What this site is">
        <p>
          FITNEX WOMEN is a demonstration storefront built to show how the shopping
          experience would look and behave. It is not an operating shop.
        </p>
        <p>
          You cannot buy anything here. Checkout validates its forms and renders a
          review and completion screen, but takes no payment, creates no order,
          reserves no stock, and ships nothing. No contract of sale can be formed
          through this site.
        </p>
      </SupportSection>

      <SupportSection id="terms-content" title="Product information and imagery">
        <p>
          Product names, descriptions, specifications, prices, and images come from a
          public catalog scrape of marketplace listings. They are shown to populate a
          realistic storefront and may be inaccurate, outdated, or no longer offered
          anywhere.
        </p>
        <p>
          Prices shown are those recorded in that source data. They are not an offer.
          Ratings that appear on a product page are from the original marketplace
          listing, are labelled as such, and are not FITNEX customer reviews — FITNEX
          has collected none.
        </p>
      </SupportSection>

      <SupportSection id="terms-availability" title="Availability of the site">
        <p>
          The site is provided as it is, without any guarantee that it will be
          available, complete, or free of defects. Features described in the{' '}
          <Link to="/help" className="font-medium text-brand-600 hover:underline">
            help centre
          </Link>{' '}
          may change or be removed as development continues.
        </p>
      </SupportSection>

      <SupportSection id="terms-data" title="Your data">
        <p>
          How this build handles what you enter is described on the{' '}
          <Link to="/privacy" className="font-medium text-brand-600 hover:underline">
            privacy page
          </Link>
          , which describes observed behaviour rather than making commitments.
        </p>
      </SupportSection>

      <SupportSection id="terms-pending" title="What published terms would still need">
        <p>
          Terms of sale need the merchant's legal entity and registered address, the
          governing law and jurisdiction, how a contract is formed, pricing and tax
          treatment, delivery and returns rights, liability limits, and a complaints
          route. None of those has been supplied, and none is invented here — nor is
          any other company's terms copied in as a placeholder.
        </p>
      </SupportSection>
    </SupportLayout>
  )
}
