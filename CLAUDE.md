# CLAUDE.md — FITNEX WOMEN

Claude-specific entry point for this repository.

**`AGENTS.md` is the main instruction source. Read it first and in full.**
This file does not restate it; it tells you how to enter the work and flags
what Claude in particular tends to get wrong here.

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

## Read these before writing code

| Order | File | Why |
|---|---|---|
| 1 | [AGENTS.md](./AGENTS.md) | Conventions, boundaries, validation rules |
| 2 | [docs/PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) | What actually exists right now versus what is planned |
| 3 | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Where code belongs |
| 4 | [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | Tokens and visual direction (for UI work) |
| 4a | [docs/CHECKOUT.md](./docs/CHECKOUT.md) | Before touching checkout, billing, or the confirmation |
| 4b | [docs/CUSTOMER_PAGES.md](./docs/CUSTOMER_PAGES.md) | Before touching the customer, wishlist, or support pages |
| 5 | [docs/SKILLS_INDEX.md](./docs/SKILLS_INDEX.md) | Which skills apply, and their caveats |
| 6 | The relevant `SKILL.md` files themselves | The actual guidance |

## Skills are files, not context

The skills in `.agents/skills/` are **not** in your context window. Nothing
loads them for you. Having read `docs/SKILLS_INDEX.md` is not the same as
having read a skill — the index is a table of contents with caveats attached.

Before UI, styling, animation, accessibility, or database work, open the
relevant `SKILL.md` with a file-reading tool and read it. Several skills keep
their real substance in `rules/` or `references/` subdirectories that the
`SKILL.md` names; follow those pointers.

Exact relative paths are listed in
[docs/SKILLS_INDEX.md](./docs/SKILLS_INDEX.md). Resolve names from disk rather
than from memory — several directory names differ from what you might guess.

## Things to get right in this repository

- **Tailwind is v4.** Configuration lives in CSS (`@theme` in
  `src/styles/globals.css`). Do not create `tailwind.config.js`, and do not
  apply v3 patterns from memory.
- **Animation is `motion`, not `framer-motion`.** Import from `motion/react`.
  The installed `framer-motion-react` skill still documents the old name.
- **This is JavaScript, not TypeScript.** Several skills show `.tsx` and typed
  props; translate, do not transplant. Files are `.jsx`.
- **Zod is v4**, paired with `@hookform/resolvers` v5.
- **The shadcn CLI has generated `import { cn } from "cn"`** instead of
  `from "@/lib/utils"`. Check and fix after adding any component — it breaks
  the build.
- **Never expose secrets.** The Supabase service-role key and the Cloudinary
  API key/secret must never appear in frontend code or a `VITE_` variable.
- **Preserve `banners/` and `pages/`.** Originals and references; do not edit,
  move, or delete them.

## Honesty requirements

- **Do not claim a check passed unless you ran it and saw it pass.** Quote the
  failure if it failed.
- **Do not describe checkout or payment as working.** Phase 3 built the
  checkout screens as a *demonstration*: they validate, navigate, and render,
  but take no payment, create no order, and persist nothing server-side. No
  payment provider is integrated. Never add a card, expiry, CVV, UPI-ID, or
  banking field to the flow, and never show a payable grand total, a delivery
  date, a paid status, an invoice, or tracking — none of them exist.
- Distinguish verified facts from assumptions in what you report.
- The database is currently empty — no tables exist. Do not write code that
  assumes a schema without first checking or creating one.

## After making changes

Run `npm run lint` and `npm run build`, exercise the affected routes in a
browser, then update `docs/PROJECT_STATUS.md` and any documentation your
change affected.
