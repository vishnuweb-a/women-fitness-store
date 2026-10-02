/**
 * Help centre.
 *
 * Describes **implemented behaviour only**. Every claim below corresponds to
 * something in this build: browsing and filtering, the listed options caveat,
 * the persistent wishlist, the browser-local bag, the demo checkout, the
 * image fallback chain, and the session-only customer previews.
 *
 * There is nothing here about delivery times, return windows, order tracking,
 * payment methods accepted, or customer service hours — none of those exist,
 * and a help page is exactly where an invented one would be believed.
 */
import { Link } from 'react-router-dom'

import { SupportLayout, SupportNote, SupportSection } from '@/features/support/support-layout'

/** One question and its answer. */
function Faq({ question, children }) {
  return (
    <div className="rounded-card border border-border p-4">
      <h3 className="text-sm font-semibold text-ink-950">{question}</h3>
      <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-ink-800">
        {children}
      </div>
    </div>
  )
}

export function HelpPage() {
  return (
    <SupportLayout
      title="Help centre"
      description="What this storefront can do today, in plain language — and what it deliberately cannot."
      status={
        <SupportNote>
          FITNEX WOMEN is a demonstration storefront. Everything described here was
          checked against the build; anything not described is not implemented.
        </SupportNote>
      }
    >
      <SupportSection id="help-shopping" title="Browsing and finding products">
        <div className="grid gap-3">
          <Faq question="How do I find a product?">
            <p>
              Use the search in the header, browse{' '}
              <Link to="/collections" className="font-medium text-brand-600 hover:underline">
                all products
              </Link>
              , or open a category. Listings can be filtered by category, brand,
              price, listed size, and listed colour, and sorted by price or name.
            </p>
            <p>
              Filters and sorting are kept in the address bar, so a filtered view can
              be bookmarked or shared and the browser's back button behaves as you
              would expect.
            </p>
          </Faq>

          <Faq question="Why is there no “new arrivals”, “best sellers”, or “sale”?">
            <p>
              The catalog carries no arrival date, no sales ranking, and no discount,
              so those listings would be sorted on data that does not exist. “Featured”
              is catalog order, and the listing says so.
            </p>
          </Faq>

          <Faq question="Are the sizes and colours shown actually available together?">
            <p>
              Not necessarily. The source lists sizes and colours as independent
              lists and never records which combinations exist, so selecting a size
              finds a product that <em>lists</em> that size. Stock is unknown for
              every product, which is why you will not see an “in stock” badge
              anywhere.
            </p>
          </Faq>

          <Faq question="Why is a product image sometimes a plain placeholder?">
            <p>
              Images are delivered from Cloudinary. If an image cannot be fetched, a
              neutral placeholder shipped with the site is shown rather than a broken
              image icon. The product and its details are unaffected.
            </p>
          </Faq>
        </div>
      </SupportSection>

      <SupportSection id="help-wishlist" title="Wishlist and bag">
        <div className="grid gap-3">
          <Faq question="Where is my wishlist stored?">
            <p>
              In this browser, on this device. Selecting the heart on a product saves
              it to{' '}
              <Link to="/wishlist" className="font-medium text-brand-600 hover:underline">
                your wishlist
              </Link>
              , and it stays there after you close the tab. It is not synced to an
              account, is not visible to anyone else, and reserves nothing.
            </p>
            <p>
              Clearing your browser's site data removes it. Using a different browser
              or device shows a different, empty wishlist.
            </p>
          </Faq>

          <Faq question="Why does my wishlist send me to the product page to add an item?">
            <p>
              For products that list more than one size or colour, the wishlist saves
              the product, not a specific variant. Rather than choosing one for you,
              it links you to the product page to pick. Products with a single listed
              option, or none, are added directly.
            </p>
          </Faq>

          <Faq question="Is my bag saved?">
            <p>
              Your bag is stored in this browser too, and survives a reload. The same
              limits apply: nothing is synced, and nothing is reserved. Prices and
              names are always read from the current catalog, so the bag can never
              show you a stale price.
            </p>
          </Faq>
        </div>
      </SupportSection>

      <SupportSection id="help-checkout" title="Checkout">
        <div className="grid gap-3">
          <Faq question="Can I actually buy something?">
            <p>
              No. Checkout is a frontend demonstration: it validates the delivery and
              billing forms, lets you record a payment-method preference, and shows a
              review and a completion screen. <strong>No payment is taken, no order
              is created, and nothing is shipped.</strong>
            </p>
            <p>
              No card number, UPI ID, or banking detail is collected at any point in
              the flow — there is nowhere for one to go.
            </p>
          </Faq>

          <Faq question="Why is there no total, delivery date, or shipping cost?">
            <p>
              Only a merchandise subtotal can be calculated. Shipping rates, taxes,
              and delivery estimates all need backend systems this build does not
              have, so they are reported as “not calculated” rather than guessed at.
            </p>
          </Faq>

          <Faq question="What happened to the details I entered at checkout?">
            <p>
              They were held in memory for that page session and never written to
              storage, a cookie, or the address bar. Reloading clears them, which is
              deliberate.
            </p>
          </Faq>
        </div>
      </SupportSection>

      <SupportSection id="help-account" title="Customer pages">
        <div className="grid gap-3">
          <Faq question="How do I sign in or create an account?">
            <p>
              You cannot — there is no sign-in and no account system in this build.
              The{' '}
              <Link to="/account" className="font-medium text-brand-600 hover:underline">
                customer hub
              </Link>{' '}
              previews what those areas would hold, without pretending anyone is
              signed in.
            </p>
          </Faq>

          <Faq question="Are the profile and address previews saved?">
            <p>
              No. Anything entered on the profile or address preview pages is held in
              memory for the current session only. It is not written to storage or
              cookies, never appears in the address bar, is not sent anywhere, and is
              cleared when you reload. The buttons say “apply to preview” rather than
              “save” for that reason.
            </p>
          </Faq>

          <Faq question="Why is my order history empty?">
            <p>
              Because no orders exist. The{' '}
              <Link
                to="/account/orders"
                className="font-medium text-brand-600 hover:underline"
              >
                demo orders page
              </Link>{' '}
              lists demo checkouts completed in the current browser tab, and those
              records are cleared on reload along with everything else held in memory.
            </p>
          </Faq>
        </div>
      </SupportSection>

      <SupportSection id="help-policies" title="Policies">
        <p>
          The{' '}
          <Link to="/shipping" className="font-medium text-brand-600 hover:underline">
            shipping
          </Link>{' '}
          and{' '}
          <Link to="/returns" className="font-medium text-brand-600 hover:underline">
            returns
          </Link>{' '}
          pages do not state terms, because FITNEX has not set them. The{' '}
          <Link to="/privacy" className="font-medium text-brand-600 hover:underline">
            privacy
          </Link>{' '}
          and{' '}
          <Link to="/terms" className="font-medium text-brand-600 hover:underline">
            terms
          </Link>{' '}
          pages are clearly marked drafts describing observed behaviour, pending a
          merchant and legal review. Each page carries its status at the top.
        </p>
      </SupportSection>
    </SupportLayout>
  )
}
