/**
 * Disclaimer.
 *
 * Built from what the storefront demonstrably does — the same facts the help,
 * privacy, and terms pages state — rather than from a template. It limits no
 * statutory right, names no governing law, and sets no liability cap: those
 * are legal decisions for the owner, not for the people who built the
 * frontend, so the page lists them as awaiting review instead.
 */
import { Link } from 'react-router-dom'

import { SupportLayout, SupportSection } from '@/features/support/support-layout'
import { COMPANY_INFO } from '@/lib/company-info'

export function DisclaimerPage() {
  return (
    <SupportLayout
      title="Disclaimer"
      description="The limits of the product information and features on the FITNEX WOMEN website."
    >
      <SupportSection id="disclaimer-operator" title="About this website">
        <p>
          This website is operated by {COMPANY_INFO.legalName}. It is currently a
          demonstration storefront: you can browse the catalog, but you cannot buy
          anything here.
        </p>
      </SupportSection>

      <SupportSection id="disclaimer-products" title="Product information">
        <p>
          Product names, descriptions, specifications, prices, and images come from a
          public catalog of marketplace listings. They may be inaccurate, incomplete,
          or out of date, and a product shown here may not be offered.
        </p>
        <p>
          Images may not exactly match a product's colour, size, or finish. Sizes and
          colours are listed separately in the source, so a listed combination is not
          confirmed to exist. No stock information is available for any product.
        </p>
        <p>
          Ratings shown on a product page come from the original marketplace listing
          and are labelled as such. They are not reviews from FITNEX customers.
        </p>
      </SupportSection>

      <SupportSection id="disclaimer-prices" title="Prices and checkout">
        <p>
          Prices are those recorded in the source data and are not an offer to sell.
          Checkout is a demonstration: it takes no payment, creates no order, and
          ships nothing, so no sale can be completed through this website.
        </p>
      </SupportSection>

      <SupportSection id="disclaimer-advice" title="General information only">
        <p>
          Product descriptions and any fitness content on this website are general
          information. They are not medical, health, or professional training advice.
          Consider speaking to a qualified professional before starting a new exercise
          routine or using unfamiliar equipment.
        </p>
      </SupportSection>

      <SupportSection id="disclaimer-third-parties" title="Third-party services">
        <p>
          Product images are delivered by Cloudinary and the site's fonts by Google
          Fonts. Those services are run by other companies under their own terms. The{' '}
          <Link to="/privacy" className="font-medium text-brand-600 hover:underline">
            privacy page
          </Link>{' '}
          describes which requests they receive.
        </p>
      </SupportSection>

      <SupportSection id="disclaimer-pending" title="What is still awaiting review">
        <p>
          A finished disclaimer may also need limits of liability and the governing law
          and jurisdiction. Neither has been set, and neither is invented here. The{' '}
          <Link to="/terms" className="font-medium text-brand-600 hover:underline">
            terms page
          </Link>{' '}
          describes what using this website does and does not involve.
        </p>
      </SupportSection>
    </SupportLayout>
  )
}
