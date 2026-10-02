# AGENTS.md — FITNEX WOMEN

Shared instructions for any agent or developer working in this repository.
This is the main instruction source; `CLAUDE.md` is the Claude-specific entry
point and defers to this file.

## Required workflow

**Before implementing or modifying any feature:**

1. Read the root AGENTS.md and CLAUDE.md.
2. Read docs/PROJECT_STATUS.md and the relevant architecture/design documentation.
3. Consult docs/SKILLS_INDEX.md.
4. Open and read every SKILL.md relevant to the requested work, plus required supporting files.
5. Inspect existing components, services, routes, and reference assets.
6. Implement using the established project conventions.
7. Run checks appropriate to the change.
8. Update project status and affected documentation.
9. Report what changed, what was verified, and any remaining limitations.

Step 4 means **actually opening the files**. Skills are not loaded into context
automatically, and `docs/SKILLS_INDEX.md` is an index — reading the index is
not reading the skill.

## Project purpose and scope

An e-commerce storefront for **FITNEX WOMEN**, selling sports and fitness
accessories for women. Tagline: *Stronger Every Day*.

**Frontend-first.** This repository contains a React SPA only. There is no
backend here. Supabase is the intended data layer; any server-side logic
belongs in Supabase Edge Functions, not in this bundle.

Phase 0 delivered a runnable shell with routing, layout, tokens, and
integration boundaries. Phase 3 built the checkout screens, but **as a frontend
demonstration only**: no payment provider is integrated, no order is created,
nothing is persisted server-side, and no card, UPI, or banking credential is
collected anywhere. Describe it as a demonstration, never as operational
checkout or payment, and never add a payment-credential field to it.

## Stack and architecture

React 19 + JavaScript/JSX, Vite 8, Tailwind CSS v4, shadcn/ui, `motion`,
React Router 7, TanStack Query 5, React Hook Form + Zod 4, lucide-react,
Supabase JS, ESLint 9.

Full detail, directory layout, and boundaries: `docs/ARCHITECTURE.md`.

- `@/` resolves to `src/` — configured in both `vite.config.js` and
  `jsconfig.json`. Keep the two in sync.
- **No `tailwind.config.js`.** Tailwind v4 is configured in CSS via `@theme` in
  `src/styles/globals.css`. Never add a v3-style JS config.
- shadcn is configured for JavaScript (`"tsx": false`); components generate as
  `.jsx`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve the build |
| `npm run lint` | ESLint |

npm only — `package-lock.json` is the committed lockfile.

## Reference assets and visual direction

- `pages/` — eight storefront screens as images. **Reference only**; never
  import these and never treat them as route components.
- `banners/` — nine original promotional PNGs. **Preserve; never edit.**
  Runtime copies live in `public/assets/banners/`.

Direction: black and charcoal athletic imagery; white and light-gray shopping
surfaces; one strong red for actions and promotions; bold athletic headings;
clear product photography; women-centred fitness imagery; compact, readable
product cards.

Tokens and the full rationale: `docs/DESIGN_SYSTEM.md`.

**Promotional text and buttons belong in HTML**, layered over the artwork —
not baked into an image. Where a banner already contains a headline or a
button shape, give the image `alt=""` plus `aria-hidden="true"` and provide a
real heading and a real link or button on top.

## Conventions

### Components

- Functional components only — except error boundaries, which must be classes.
- Named exports, not default exports (route modules included).
- Files `kebab-case.jsx`; components `PascalCase`.
- Keep components small; split past ~150 lines.
- Feature-specific code lives in `src/features/<feature>/`. A feature never
  imports another feature's internals — promote shared code to
  `src/components/shared/`.
- `src/components/ui/` is shadcn-generated. Add with
  `npx shadcn@latest add <component>`, then **check the generated import of
  `cn`**: the CLI has produced `from "cn"` instead of `from "@/lib/utils"`,
  which breaks the build.

### Routing

- Routes are declared in `src/app/router.jsx`; every route nests in
  `RootLayout`.
- Filters, sorting, and pagination belong in URL search params so listings are
  shareable and back/forward behave.
- **Every route renders exactly one `PageMeta`** so it gets its own title and
  description. Most inherit it from `PageShell`, `SupportLayout`,
  `CustomerLayout`, or `CheckoutLayout`; a route that returns a guard branch
  before reaching its layout needs its own. Do not add a second: React appends
  hoisted metadata rather than replacing it, so duplicates ship. For the same
  reason, never put a `<title>` or `<meta name="description">` back into
  `index.html`. Detail: `docs/ARCHITECTURE.md`.
- Demo and per-visitor routes (cart, checkout, confirmation, `/account/*`,
  not-found) carry `noIndex`. Keep it.
- **Do not invent a canonical URL, `og:url`, `og:image`, or a production
  domain.** None exists.

### Styling

- Tailwind utilities in `className` first. Extract a component before writing
  a large custom CSS file; keep custom CSS global (resets and tokens only).
- Use design tokens, not arbitrary values. Reach for `bg-brand-500`, not an
  arbitrary hex value.
- Merge conditional classes with `cn()` from `@/lib/utils`.
- Mobile-first: base styles, then `sm:`, then `md:`, then `lg:`.

### Forms

- React Hook Form with a Zod schema via `@hookform/resolvers/zod`. Zod is v4.
- Every input needs a connected `<label htmlFor>`; errors use
  `aria-describedby` plus `aria-invalid` and `role="alert"`.
- Validate on the client for UX and again server-side for trust.

### State

- Server data goes through TanStack Query, with keys namespaced per feature.
- Supabase calls live in `src/services/`, never inside a component.
- Local UI state stays co-located.

## Supabase and Cloudinary boundaries

**Hard rules — these are not style preferences:**

- Frontend may use **only** the Supabase project URL and the publishable
  (anon) key.
- The **service-role key must never** appear in frontend code, in a `VITE_`
  variable, or in the bundle. It bypasses RLS entirely.
- Cloudinary's **API key and secret must never** reach the browser. Do not
  install the server-side `cloudinary` SDK.
- No credential-based browser uploads. Sign uploads in a trusted backend
  (Supabase Edge Function), or use a tightly restricted unsigned preset.
- Enable Row Level Security on every table before the frontend reads it.
- Read environment values through `src/lib/env.js` only.

Current state and the variable mapping: `docs/PROJECT_SETUP.md`.

## Accessibility and responsive requirements

Non-negotiable. Read `.agents/skills/frontend-a11y/SKILL.md` before building
forms or interactive controls.

- Semantic HTML first; ARIA only where semantics fall short.
- One `h1` per page (via `PageShell`); never skip heading levels.
- Every interactive element reachable and operable by keyboard.
- Visible focus on everything focusable. Never remove a focus ring without an
  equally visible replacement.
- Icon-only buttons need `aria-label`; decorative icons and images need
  `aria-hidden="true"` and `alt=""`.
- Touch targets at least 44x44px.
- Body text at least 16px; contrast at least 4.5:1.
- Respect `prefers-reduced-motion` (handled globally, but do not defeat it).
- Layouts must work from 320px up with no horizontal scroll.

## Validation expectations

Before reporting work complete:

1. `npm run lint` — clean.
2. `npm run build` — succeeds.
3. Exercise the affected routes in a browser; confirm they render and the
   console is free of errors.
4. Check keyboard navigation and focus order on anything interactive.
5. Confirm no secret reached the bundle when configuration changed.

**Never report a check as passed unless you ran it and it passed.** Report
failures with their output.

Phase 5 ran a browser audit harness (Playwright + axe-core, installed
**outside** the repository so no test-only dependency entered
`package.json`) against the production preview: 24 route cases x 4 viewports,
an end-to-end journey, a keyboard/focus pass, and a privacy sweep. What it
covered and what it did not is recorded in `docs/FRONTEND_FINAL_QA.md`. If you
change routing, layout, or metadata, re-run an equivalent check rather than
assuming the recorded result still holds.

An automated accessibility pass does not prove accessibility. Do not claim it
does.

## Documentation maintenance

When behaviour changes, update the affected file in the same change:

| File | Covers |
|---|---|
| `docs/PROJECT_STATUS.md` | What exists, what is verified, what is pending — update every phase |
| `docs/ARCHITECTURE.md` | Structure, routing, state, boundaries |
| `docs/DESIGN_SYSTEM.md` | Tokens, assets, visual conventions |
| `docs/PROJECT_SETUP.md` | Install, environment, integrations |
| `docs/CATALOG.md` | Product data provenance, price units, Cloudinary upload pipeline |
| `docs/CHECKOUT.md` | The demo checkout flow: what it does and does not do, and the backend seams |
| `docs/CUSTOMER_PAGES.md` | Customer pages, session-only previews, wishlist, support and policy status |
| `docs/FRONTEND_FINAL_QA.md` | Phase 5 QA: coverage, verified checks, bugs fixed, measurements, hosting requirements, and what was *not* verified |
| `docs/SKILLS_INDEX.md` | Installed skills — update if `.agents/skills/` changes |
| `README.md` | Orientation |

Distinguish **verified** from **assumed**. If something was not run, say so.

## Skill discovery and loading workflow

Skills live in `.agents/skills/`. They are files on disk, **not** automatically
present in any model's context.

1. List the directory — do not rely on remembered names.
2. Open `docs/SKILLS_INDEX.md` to find which skills apply.
3. **Read each relevant `SKILL.md` in full**, plus the supporting files it
   names (several keep their substance in `rules/` or `references/`).
4. Apply the guidance, noting where the index records a caveat.

Known caveats recorded in the index — check it for the current list:

- `framer-motion-react` documents the old package. This project uses `motion`,
  imported from `motion/react`.
- `frontend-architect-reactjs_v19_nextjs_v15` targets Next.js + TypeScript;
  only its React 19 client guidance applies.
- `tailwind-4-docs` needs a local snapshot that is not initialised.
- `frontend-slides` is presentation tooling — not for storefront work.
