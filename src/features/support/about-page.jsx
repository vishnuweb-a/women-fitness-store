/**
 * About us.
 *
 * States only what is known: what FITNEX WOMEN sells, which company operates
 * it, and where the storefront is today. There is no founding story, no year,
 * no team size, no mission statement, and no claim of certification or
 * registration beyond the company name — none of those has been supplied, and
 * an About page is where an invented one is most readily believed.
 *
 * The company's contact details follow from `SupportLayout`.
 */
import { Link } from 'react-router-dom'

import { SupportLayout, SupportSection } from '@/features/support/support-layout'
import { COMPANY_INFO } from '@/lib/company-info'
import { CATEGORY_NAV } from '@/services/category-meta'

export function AboutPage() {
  return (
    <SupportLayout
      title="About us"
      description={`FITNEX WOMEN sells sports and fitness accessories for women, and is operated by ${COMPANY_INFO.legalName}.`}
    >
      <SupportSection id="about-who" title="Who we are">
        <p>
          FITNEX WOMEN is a storefront for sports and fitness accessories designed for
          women. Its motto is <strong>Stronger Every Day</strong>.
        </p>
        <p>
          The store and this website are operated by {COMPANY_INFO.legalName},
          registered at {COMPANY_INFO.address}.
        </p>
      </SupportSection>

      <SupportSection id="about-range" title="What you will find here">
        <p>The catalog is organised into three collections:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          {CATEGORY_NAV.map((category) => (
            <li key={category.slug}>
              <Link
                to={`/collections/${category.slug}`}
                className="font-medium text-brand-600 hover:underline"
              >
                {category.longLabel}
              </Link>{' '}
              — {category.description}
            </li>
          ))}
        </ul>
      </SupportSection>

      <SupportSection id="about-today" title="Where the store is today">
        <p>
          Browsing, search, filtering, the wishlist, and the bag all work. Checkout is
          a demonstration: it checks your details and shows what an order would look
          like, but takes no payment, creates no order, and ships nothing.
        </p>
        <p>
          Product names, descriptions, prices, and images come from a public catalog
          of marketplace listings, and may not reflect what is finally offered. The{' '}
          <Link to="/help" className="font-medium text-brand-600 hover:underline">
            help centre
          </Link>{' '}
          explains what the storefront does in detail, and the{' '}
          <Link to="/disclaimer" className="font-medium text-brand-600 hover:underline">
            disclaimer
          </Link>{' '}
          sets out the limits of the information shown.
        </p>
      </SupportSection>
    </SupportLayout>
  )
}
