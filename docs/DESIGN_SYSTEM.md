# Design System — FITNEX WOMEN

Brand name **FITNEX WOMEN** is taken from the reference screens themselves
(the logo lockup, the `#StrongerEveryday` hashtag, and the footer line
"Stronger People. A Healthier World."), not assigned arbitrarily.

Tagline: **Stronger Every Day.**

## Reference assets

### `pages/` — screen references (do not ship; not route components)

These are flat images only. No markup exists for them yet. Keep this folder
separate from `src/features/`.

| File | Screens | Use for |
|---|---|---|
| `pages/women1.png` | `01 HOME`, `02 COLLECTIONS`, `03 CATEGORY` | Home hero and sections, collection tiles, category listing with filter rail |
| `pages/women2.png` | `04 PRODUCT DETAILS`, `05 SHOPPING CART` | Gallery, variant pickers, reviews; bag line items and order summary |
| `pages/women3.png` | `06 CHECKOUT`, `07 BILLING & PAYMENT`, `08 ORDER CONFIRMATION` | Checkout stepper, address and payment forms, confirmation and tracking |

### `banners/` — promotional artwork (originals, preserved)

`banner1.png` … `banner9.png`. **Never edit or delete these.** Optimised WebP
runtime copies live at `public/assets/banners/` and are served from
`/assets/banners/*.webp`. Regenerate them with
`python scripts/optimise-banners.py` after changing an original — the script
reads `banners/` and writes `public/assets/banners/`, never the reverse.

Optimisation caps the long edge at 2000 px (banners never render wider than the
80rem container) and encodes WebP at quality 82: **17.4 MB of PNG becomes
1.04 MB**, which is the difference between an 18.4 MB and a 2.1 MB production
build.

All nine banners were inspected. Every one has **both a headline and a button
shape baked into the pixels**:

| File | Baked-in copy | Used as |
|---|---|---|
| `banner1` | "STRONGER EVERY DAY" + SHOP ACCESSORIES | Home hero |
| `banner2` | "FIND YOUR MOVEMENT" + none | available |
| `banner3` | "YOGA & PILATES" + Shop Collection | Sportswear tile, Sportswear category thumb |
| `banner4` | "GYM BAGS" + Shop Collection | Accessories tile, Accessories category thumb |
| `banner5` | "STRENGTH TRAINING" + Shop Collection | Equipment tile, Equipment category thumb |
| `banner6` | "HYDRATION" + Shop Collection | Accessories tile |
| `banner7` | "RECOVERY" + Shop Collection | available |
| `banner8` | "OUTDOOR ESSENTIALS" + Shop Collection | available |
| `banner9` | "GEAR UP FOR A STRONGER TOMORROW" + SHOP ALL ACCESSORIES | Home closing banner |

Because the copy is already legible in the artwork, `PromotionalBanner` does
**not** layer duplicate HTML text over these tiles — that would show the
headline twice. Instead the image is decorative (`alt=""`, `aria-hidden`) and a
single real `<Link>` wraps the tile, taking its accessible name from visually
hidden text. The hero is the exception: `HeroBanner` crops `banner1` to its
photographic side and renders the headline as a real `h1`, because a hero
heading must be a real heading.

> **Accessibility rule for banner art.** Several banners have headlines and
> button shapes baked into the pixels. A picture of a button is not a button.
> Always render the headline and the call to action as real HTML on top of the
> image, and give the decorative image `alt=""` with `aria-hidden="true"` so
> the text is not announced twice. `src/features/home/home-page.jsx` is the
> worked example. If an image must carry meaning on its own, write descriptive
> `alt` text instead.

## Tokens

Defined in [`src/styles/globals.css`](../src/styles/globals.css) via Tailwind
v4's `@theme`. There is **no `tailwind.config.js`** — v4 is configured in CSS.
Colours are OKLCH for perceptually even ramps.

### Colour

| Group | Tokens | Role |
|---|---|---|
| Brand red | `--color-brand-50` … `--color-brand-900` | Primary actions, sale badges, price-drop text, promotional accents. Used sparingly so it keeps its urgency. |
| Ink | `--color-ink-50` … `--color-ink-950` | Charcoal/black hero bands, headings, footer, body text. `ink-950` is the athletic-imagery backdrop. |
| Semantic | `--color-success`, `--color-warning` | In-stock and advisory states. |

Shopping surfaces stay white and light gray (`--background`, `--muted`), as in
the references — product grids and cart rows must not compete with the hero.

shadcn/ui semantic variables (`--background`, `--primary`, `--border`, `--ring`,
and so on) are declared under `:root` and `.dark`, then mapped into Tailwind's
colour namespace with `@theme inline`. `--primary` is brand red; `--ring` matches
it so focus rings read as brand.

Dark mode is **class-driven** (`@custom-variant dark (&:is(.dark *))`) — toggle
by adding `.dark` to `<html>`. It is defined but there is no UI toggle yet.

### Typography

| Token | Value | Role |
|---|---|---|
| `--font-sans` | Inter + system stack | Body, UI, product copy |
| `--font-display` | Archivo, falling back to Inter | Bold athletic headings |
| `--text-display-sm/md/lg` | `clamp()` ramps | Fluid headings |

Fluid sizes always pair `vw` with `rem` so browser zoom keeps working.

**Both webfonts are loaded**, from Google Fonts in `index.html` with
`preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` and
`display=swap`: Inter (400/500/600/700) and Archivo (600/700/800/900). The
`@theme` tokens keep the full system fallback stack, so text stays readable and
correctly sized if the webfonts fail to load.

### Spacing, containers, radius

| Token | Value | Role |
|---|---|---|
| `--spacing-section` | `clamp(2.5rem, 1.5rem + 4vw, 5rem)` | Vertical rhythm between sections |
| `--container-site` | `80rem` | Max content width |
| `--radius-card` | `0.625rem` | Product cards |
| `--radius-control` | `0.5rem` | Buttons, inputs |

The `container-site` utility centres content and steps padding 1rem → 1.5rem
(≥48rem) → 2rem (≥64rem).

### Borders and focus

Tailwind v4 defaults `border-color` to `currentColor`; a base rule restores
`var(--border)` so borders stay neutral. Focus is one visible treatment
everywhere — a 2px `--ring` outline at 2px offset. **Never remove a focus ring
without an equally visible replacement.**

### Motion

| Token | Value |
|---|---|
| `--ease-athletic` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--duration-fast` | `150ms` |
| `--duration-base` | `250ms` |

`prefers-reduced-motion: reduce` is honoured globally in `@layer base`, which
near-zeroes animation and transition durations. Animate `transform` and
`opacity`; avoid animating `width`/`height`.

Animation library: **`motion`**, imported as `motion/react`.

## Component conventions

- Compact, readable product cards — the reference grid fits 4 across on
  desktop and 2 on mobile.
- Minimum 44×44px touch targets for controls (WCAG 2.2); icon buttons use
  `size-11`-equivalent sizing and always carry an `aria-label`.
- Decorative icons take `aria-hidden="true"` and `focusable="false"`.
- One `h1` per page, supplied by `PageShell`; heading levels never skip.
- Prefer Tailwind utilities in markup. Extract a component before writing a
  large custom CSS file; keep custom CSS global (resets and tokens only).

### Storefront components (Phase 1)

| Component | File | Notes |
|---|---|---|
| `AnnouncementBar` | `layout/site-header.jsx` | Exported from the header module |
| `StoreHeader` | `layout/site-header.jsx` (`SiteHeader`) | Announcement, brand, search, account/wishlist/bag |
| `DesktopNavigation` / `MobileNavigation` | `layout/site-header.jsx` | Category bar and Sheet, both from real categories |
| `SearchPanel` | `layout/search-panel.jsx` | Combobox overlay over the real catalog |
| `StoreFooter` | `layout/site-footer.jsx` (`SiteFooter`) | Newsletter, trust row, link columns |
| `HeroBanner` | `shared/hero-banner.jsx` | Real `h1` over cropped artwork |
| `CategoryCard` | `shared/category-card.jsx` | Circular rail tile |
| `ProductCard` | `shared/product-card.jsx` | Compact tile |
| `ProductGrid` | `shared/product-grid.jsx` | 2 / 3 / 4 columns |
| `ProductImage` | `shared/product-image.jsx` | Stable dimensions, responsive `srcset`, error state |
| `SectionHeading` | `shared/section-heading.jsx` | Title, subtitle, "view all" link |
| `PromotionalBanner` | `shared/promotional-banner.jsx` | Decorative art + one real link |
| `NewsletterForm` | `shared/newsletter-form.jsx` | Never claims a false success |

#### Image ratios

Catalog tiles use a fixed `aspect-[3/4]` box with `object-contain`, never
`object-cover`. The catalog mixes apparel (shot tall on a model) with equipment
(a badminton racquet, a cricket bat); cropping to fill would cut the product
off. Cloudinary applies `c_pad,b_white` for the same reason, so the padding
matches the light shopping surface. `width`/`height` are always emitted so no
image causes layout shift.

#### No nested interactive elements

`ProductCard` keeps its link and its wishlist button as DOM **siblings**. The
whole tile is still clickable via a stretched-link `::after` overlay on the
title link (`z-10`), with the wishlist button raised above it (`z-20`). An
anchor is never wrapped around a button.

### Motion (Phase 1)

All animation uses `motion/react` and moves only `opacity` and `transform`:

| Where | Effect |
|---|---|
| Hero | Staggered entrance on the eyebrow, `h1`, subhead, buttons, and feature list |
| Product grids | `whileInView` reveal, `once: true`, capped 40 ms stagger |
| Product cards | 3 px hover lift plus a 1.04 image scale |
| Search panel | Backdrop fade and panel slide, with `AnimatePresence` |

Every one of these is gated on `useReducedMotion()`: when reduced motion is
requested, `initial` is set to `false` so content renders in its final state
and no animation runs. Verified in Chrome with `reducedMotion: 'reduce'` —
`h1` opacity 1, `transform: none`, product cards opacity 1. There is no scroll
hijacking anywhere.
