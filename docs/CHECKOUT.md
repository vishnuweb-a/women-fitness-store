# Checkout

**Written for: a developer picking up or extending the checkout flow.**

## What this is

`/checkout`, `/checkout/payment`, and `/orders/:id/confirmation` are a
**frontend demonstration of the checkout screens**. They were built in Phase 3.

They are not a transaction. Specifically:

- no payment provider is integrated, and none is contacted;
- no order is created, anywhere;
- nothing is written to Supabase, or to any server;
- no card number, expiry, CVV, UPI ID, or banking credential is collected;
- no payable grand total is shown, because shipping and tax cannot be
  calculated;
- the real cart is never emptied, because nothing was bought.

Every screen in the flow carries this notice:

> Demo checkout — no payment will be taken and no order will be placed.

It lives in one place, `DEMO_NOTICE` in `checkout-layout.jsx`, so the wording
cannot drift between steps.

## The flow

```
/cart  ──▶  /checkout  ──▶  /checkout/payment  ──▶  /orders/:id/confirmation
 Bag        Delivery        Billing · Method       Demo completion
                            · Review
```

Review is a mode *within* the payment route, not a fourth route. Its content is
entirely derived from the draft and the live cart, so it has no state of its
own to guard, and a reload would lose the draft either way.

## Files

| File | Role |
|---|---|
| `checkout-schema.js` | Zod schemas, the Indian state/UT list, phone normalisation, `resolveBillingAddress` |
| `checkout-state.js` | Pure reducer, step guards, `cartSignature`, snapshot builder, demo-reference generator |
| `checkout-provider.jsx` | `CheckoutProvider` — the component |
| `checkout-context.js` | `CheckoutContext` |
| `use-checkout.js` | `useCheckout`, and `useCheckoutSession` (draft joined to the live cart) |
| `checkout-layout.jsx` | Shared shell and `DEMO_NOTICE` |
| `checkout-steps.jsx` | The step indicator |
| `checkout-summary.jsx` | Order-summary sidebar |
| `checkout-guards.jsx` | Blocked-step screen, cart-changed notice, unavailable-lines notice |
| `address-fields.jsx` | `Field` and the shared address block |
| `address-summary.jsx` | Address read-back block |
| `payment-method-group.jsx` | The demo method radios |
| `checkout-review.jsx` | The review step |
| `checkout-page.jsx`, `payment-page.jsx` | The route components |
| `order-confirmation-page.jsx` | In `features/orders/` |

The provider, the context object, and the hooks are in three separate modules
for the same reason the cart is: Fast Refresh breaks on a module that exports
both components and non-components.

## Rules that the design depends on

### 1. Personal data never leaves memory

Contact and address values live in the reducer for the lifetime of one page
session. They are **never** written to `localStorage`, `sessionStorage`, a
cookie, the URL, the cart storage, a log, or an analytics call.

A reload loses the draft. That is the privacy property, not a bug — and the
guarded steps explain it rather than silently restarting.

The browser suite asserts this by dumping all persistent storage after a
completed demo checkout and failing on any personal value. If you add
persistence here, you are changing the privacy posture of the flow; say so
explicitly rather than doing it incidentally.

### 2. Billing is derived, never copied

When "billing is the same as delivery" is selected, the schema nulls
`billingAddress` and `resolveBillingAddress` derives the billing address from
whatever the delivery address **currently** is.

This is what makes editing delivery afterwards safe. A copy taken at the moment
the checkbox was ticked would go stale the first time someone used the Edit
link, and would then be shown on the review as if it were current.

The alternate billing form is validated only when it is shown. React Hook Form
keeps an unmounted form's values in state, so validating it unconditionally
attaches errors to inputs that are not on screen to fix — and blocks someone
who chose "same as delivery" with no way to see why.

### 3. A changed cart invalidates the review

`cartSignature` fingerprints product, options, quantity, **and unit price** for
every line, order-independently. A price change matters as much as an added
line: the review showed a number that is no longer current.

When the signature stops matching what the delivery step was completed against,
`reviewStale` is true, the review is withdrawn, and the person is asked to
confirm the updated items.

`reviewing` is **derived at render** (`reviewRequested && !reviewStale`), not
reset from an effect. An effect would render the stale review once before
retracting it — which is exactly the frame in which someone could press
Complete.

### 4. Completion freezes a snapshot

`buildDemoSnapshot` recomputes every total in **integer paise** from the live,
catalog-derived cart. The reducer deep-freezes the result and refuses to
overwrite an existing reference.

The reference is `DEMO-` plus two blocks of a `crypto.randomUUID`. The prefix
is deliberate: it must never read as an order number anywhere it appears, and
the confirmation page says so in as many words.

The real cart is **not** cleared on completion. No order was placed, so
emptying someone's bag would be destroying their work over a demonstration.

### 5. Guards explain; they do not redirect

Entering a step without a draft, with an empty bag, or with an unpriceable line
is an ordinary thing to do — a reload, a bookmark, a shared link. Each case
renders an explanation with a route onward, and moves focus to the heading.
Silently bouncing the URL leaves people guessing what happened.

## What was deliberately left out, and why

The reference screens (`pages/women3.png`, screens 06–08) show several things
this build cannot support. They were removed rather than imitated:

| Reference element | Why it is absent |
|---|---|
| Standard / Express delivery, "5–7 Oct", "FREE", "₹99" | No shipping data exists — no rates, carriers, or lead times |
| Coupon code field and Apply button | No promotion exists to apply |
| "Grand Total ₹4,298", "Prices are inclusive of applicable taxes" | Shipping and tax are not calculated, so no payable total can be stated |
| Cardholder name, card number, expiry, CVV | No provider, no PCI boundary. A card-shaped form here would be a trap |
| "PAY ₹4,298", the padlock, "encrypted and secure" | Nothing is paid, nothing is encrypted in transit to a processor |
| "ORDER CONFIRMED", order number, order date | No order exists |
| Estimated delivery, the Confirmed → Packed → Shipped → Delivered rail | Nothing will ship |
| "TRACK ORDER", "DOWNLOAD INVOICE" | There is nothing to track and no invoice to download |

What replaced them is the truthful version: "Not calculated" for shipping and
tax, a stated reason that a final amount needs a backend, method selection
framed as a *preference*, and a confirmation that says plainly that no order
was placed and no payment was taken.

## Backend integration points

| Area | Now | What a backend supplies |
|---|---|---|
| Orders | In-memory `DEMO-` snapshot | Orders table, real number, persistence |
| Payment | Recorded preference | Provider, PCI boundary, authorisation |
| Pricing | Merchandise subtotal in paise | Server pricing, promotions, payable total |
| Shipping | "Not calculated" | Rates, PIN serviceability, lead times |
| Tax | "Not calculated" | GST by place of supply |
| Inventory | Nothing reserved | Stock checks and reservation |
| Address | Format validation only | Verification and coverage lookup |
| Identity | None | Accounts, saved addresses, order history |
| Confirmation | Lost on reload | A persisted order to look up |

Build them roughly in that order. A payment provider is the **last** step, not
the first: no payment UI should appear before one exists.

## Testing

| Layer | Where | Covers |
|---|---|---|
| Schemas | `checkout-schema.test.js` | Trimming, email, phone forms, PIN, state list, billing derivation, hidden-form behaviour, method required, no credential field in the schema |
| State | `checkout-state.test.js` | Signatures, guards, review invalidation, reducer, snapshot immutability and totals, reference uniqueness |
| Browser | Headless Chrome against `vite preview` | The full flow, guards, privacy, responsive widths, keyboard, reduced motion |

`npm test` runs the first two. The browser suites are not committed; they are
described in `docs/PROJECT_STATUS.md` under Phase 3 with their results.

One test is worth keeping deliberately: `checkout-schema.test.js` asserts that
no schema field name matches `/card|cvv|expiry|upi|bank|ifsc/`. If someone adds
a credential field, that test fails. That is the point.
