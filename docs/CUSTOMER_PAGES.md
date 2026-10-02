# Customer pages

The customer, wishlist, and support surfaces built in Phase 4.

**There is no authentication in this build.** No sign-in, no registration, no
password reset, no session, no route protection, and no Supabase Auth. Nothing
here claims otherwise: no screen shows "Signed in", a customer identity, a
membership tier, reward points, or an order count, because none of those
exists.

Read alongside [`ARCHITECTURE.md`](./ARCHITECTURE.md) for where the code lives
and [`CHECKOUT.md`](./CHECKOUT.md) for the demo checkout these pages read from.

## Routes

| Route | Component | What it is |
|---|---|---|
| `/account` | `features/customer/customer-hub-page.jsx` | Customer hub: a route into each preview, with an honest status line for each |
| `/account/profile` | `features/customer/profile-page.jsx` | Name, email, phone — session only |
| `/account/addresses` | `features/customer/address-preview-page.jsx` | Address previews with a default — session only |
| `/account/orders` | `features/customer/demo-orders-page.jsx` | Demo checkout snapshots from this browser tab |
| `/wishlist` | `features/account/wishlist-page.jsx` | Saved products — persistent in this browser |
| `/help` | `features/support/help-page.jsx` | What the storefront does, in plain language |
| `/contact` | `features/support/contact-page.jsx` | Contact, and why the form cannot send |
| `/shipping` | `features/support/policy-pages.jsx` | Policy not set |
| `/returns` | `features/support/policy-pages.jsx` | Policy not set |
| `/privacy` | `features/support/policy-pages.jsx` | Draft: observed storage and third-party behaviour |
| `/terms` | `features/support/policy-pages.jsx` | Draft notes on a demonstration site |

Every route is lazy-loaded through `app/lazy-routes.jsx` and declared in
`app/router.jsx`. The Phase 0 `/account` placeholder
(`features/account/account-page.jsx`) was replaced and the file deleted.

### Navigation

- **Header** — the account icon is labelled "Customer hub", not "Your
  account". The mobile sheet lists Customer hub and Help and support.
- **Footer** — a `Customer` column (hub, profile, addresses, demo orders,
  wishlist, bag) and a `Help` column (all six support pages).
- **Customer pages** — one `nav` (`customer-layout.jsx`), rendered as a
  sticky sidebar from `lg:` up and a horizontal scroller below it. The same
  markup in both, so there is one tab sequence and one `aria-current="page"`.
- **Support pages** — the same pattern in `support-layout.jsx`.

## Session-only customer state

`CustomerProvider` (`features/customer/customer-provider.jsx`) is mounted
above the router in `app/providers.jsx`, inside `CheckoutProvider`.

```
ErrorBoundary > QueryClientProvider > StoreProvider > CheckoutProvider > CustomerProvider > router
```

The rules behind it are a pure reducer in `customer-state.js`, so each is
testable without rendering: `customerReducer`, `ensureOneDefault`,
`getDefaultAddress`, `profileDisplayName`.

### What is held

| Value | Shape | Lifetime |
|---|---|---|
| `profile` | `{ firstName, lastName, email, phone }` or `null` | One page session |
| `addresses` | `[{ id, label, address, isDefault }]` | One page session |

### Privacy

Nothing in this provider is persisted. No `localStorage`, no
`sessionStorage`, no cookie, no URL parameter, no log line, no network
request, and nothing in Supabase carries a name, email, phone number, or
address. **A reload clears it, by design** — the same property the checkout
draft has, and every customer screen states it rather than silently
restarting.

Verified by dumping `localStorage`, `sessionStorage`, `document.cookie`, and
the URL after entering profile, address, and contact values: only
`fitnex:cart:v2` and `fitnex:wishlist:v1` are present, and no cookie is set.

### Independence from checkout

The customer previews and the checkout draft are **separate stores**, in both
directions:

- Checkout never reads the profile or address previews.
- The previews are never written from checkout.
- No preview is copied into checkout automatically.

A value typed into a preview silently becoming the address a demo checkout
ran against is exactly the surprise this separation prevents. The action
labels say "Apply to preview", never "Save".

### The one-default invariant

Whenever any address exists, **exactly one** is marked default:

- the first address added is always the default;
- a later address becomes the default only when asked;
- deleting the default promotes the first remaining entry;
- deleting the last address leaves no default, which is correct.

`ensureOneDefault` also collapses duplicate marks, so the invariant holds in
both directions rather than only "at least one". It is covered by tests that
assert it after every step of a delete-everything sequence.

### Validation

`customer-schema.js` **reuses** `addressSchema` and `normalisePhone` from
`features/checkout/checkout-schema.js`, so there is one PIN-code rule, one
state list, and one phone normalisation in the project. Only the address
label is new (`Home`, `Work`, or a custom label).

The profile collects four fields and no more. There is no password, date of
birth, gender, or marketing preference — there is no account to secure and
nothing in this build acts on any of them, so collecting them would be
gathering sensitive data for no purpose. A test asserts the parsed profile has
exactly `firstName`, `lastName`, `email`, `phone` and strips anything else
passed in.

## Persistent wishlist

The wishlist is the deliberate exception: it holds **product ids, not personal
details**, and it is persisted by `StoreProvider`, unchanged from Phase 1.

- Key `fitnex:wishlist:v1`, a plain JSON array of id strings. **The format did
  not change in Phase 4** — a wishlist saved by an earlier build still loads,
  which a test asserts.
- Saved products survive a reload, a closed tab, and a new session.
- They are not synced anywhere and reserve no stock.

### What Phase 4 added

- Responsive cards with image, brand, name, price, and a product link.
- A `Saved products (n)` count.
- A `removeFromWishlist(id)` action on the store. Distinct from
  `toggleWishlist`: the remove button must remove, never re-add.
- An empty state with **Continue shopping**.
- Accessible feedback through one persistent `role="status"` live region.
- **Unavailable products.** A saved id whose product has left the catalog is
  reported through `unavailableWishlistIds` and shown in its own section with
  a remove action, instead of silently vanishing. `wishlistCount` counts only
  renderable products, so the header badge always matches the page.

### Variant selection

The wishlist saves a product, not a variant. For a product that requires a
choice — clothing listing more than one size, or anything listing more than
one colour — the card shows **Choose options** and links to the product page.
Only a product with a single listed option (or none) gets a direct **Add to
bag**. `requiresOptionChoice` in `features/account/wishlist-options.js`
mirrors the product page's rule, and a test asserts the two agree across the
whole catalog.

## Demo order integration

`/account/orders` is a **read** of `CheckoutProvider`'s frozen `completed`
snapshots. There is exactly one order store in this project and this is not a
second one: nothing is copied, cached, or mutated.

`listDemoSnapshots` (`features/customer/demo-orders.js`) returns them newest
first by the recorded `createdAt`, rather than relying on key enumeration
order.

### What is shown

Only fields the snapshot carries: the `DEMO-` reference, the items with their
options and quantities, the merchandise subtotal, the recorded payment-method
preference, and the completion time — the last only when the snapshot
recorded one. Every entry is labelled **Demo checkout**.

**View details** links to the existing `/orders/:id/confirmation` route. No
parallel detail page was built.

### What is deliberately absent

No paid or fulfilled status, shipment, tracking, invoice, cancellation,
refund, delivery date, grand total, shipping charge, or tax. A test asserts
the snapshot carries none of those properties, so the page cannot start
rendering one.

### Empty and reload behaviour

The empty state reads, verbatim:

> No real orders yet. Checkout currently runs in demo mode.

Snapshots live in memory, so the list is empty again after a reload. An
unknown reference at `/orders/:id/confirmation` keeps the existing
demo-session-unavailable state and does not echo the id back.

## Support and policy limitations

| Page | Status | Why |
|---|---|---|
| `/help` | Describes implemented behaviour only | Everything stated was checked against the build |
| `/contact` | **No contact channel configured** | No email, phone, or address is published, because none is set. The form states it cannot send **before** you type, never reports success, and makes no network request |
| `/shipping` | **Policy not set** | No delivery area, charge, timeframe, carrier, or tracking is stated |
| `/returns` | **Policy not set** | No return window, eligibility, refund rule, or exchange term is stated |
| `/privacy` | **Draft for review** | Describes observed storage and third-party behaviour; no legal entity, jurisdiction, retention period, or certification is claimed |
| `/terms` | **Draft for review** | Draft notes on a demonstration site; no terms of sale |

Each page carries its status in a visible banner at the top
(`PolicyStatus` in `support-layout.jsx`), not in a footnote. No other
company's policy was copied in as a placeholder.

### What the privacy page actually states

It does **not** claim that no data leaves the browser — that would be false,
and the page says so explicitly. It names what was checked:

- `localStorage` holds `fitnex:cart:v2` and `fitnex:wishlist:v1`, and nothing
  else. No cookies are set. No analytics or advertising script is loaded.
- Checkout, profile, address, and contact values are held in memory only.
- Loading a page makes requests to **Cloudinary** (`res.cloudinary.com`, every
  product image), **Google Fonts** (`fonts.googleapis.com`,
  `fonts.gstatic.com`), and whoever hosts the site — so those services
  necessarily receive an IP address and request headers.

### Storefront chrome corrected

The announcement bar and footer previously asserted "Free shipping on orders
over ₹999" and "30-day easy returns" on every page, which the shipping and
returns pages now explicitly disclaim. Both were replaced with statements the
build supports, each linking to the page that gives the real status.

## Future backend integration points

Each is a deliberate absence, not an oversight.

| Area | Now | What a backend would supply |
|---|---|---|
| Identity | None. No sign-in exists | Authentication, a session, and a customer record to attach the rest to |
| Profile | In memory, one session | A profile row under RLS, with the customer as owner |
| Addresses | In memory, one session | An addresses table, a server-enforced single default, and address verification |
| Orders | Frozen in-memory demo snapshots | An orders table, real order numbers, server-side persistence, and history that survives a reload |
| Order detail | The existing confirmation route | Status, fulfilment, tracking, and invoices — once those exist |
| Wishlist | `localStorage`, per browser | A synced wishlist per account, with the local list as the merge source on first sign-in |
| Contact | No endpoint; the form says so | A form handler or ticketing system, and published contact details |
| Shipping / returns | Policies not set | Merchant-confirmed policies, rate quotes, serviceability by PIN, and a returns process |
| Privacy / terms | Drafts describing observed behaviour | Merchant legal entity, jurisdiction, lawful bases, retention, and data-rights routes, reviewed by a lawyer |

Route protection is **not** on this list as a frontend concern: when
authentication arrives, the server must enforce access, and any client-side
guard is a convenience on top of that rather than the control itself.
