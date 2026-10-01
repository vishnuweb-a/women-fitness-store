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

`banner1.png` … `banner9.png`. **Never edit or delete these.** Runtime copies
live at `public/assets/banners/` and are served from `/assets/banners/*.png`.

`banner1.png` is the home hero ("STRONGER EVERY DAY").

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
**Neither webfont is loaded yet** — both currently fall back to the system
stack. Add `@font-face` or a Google Fonts link when the real screens land.

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
