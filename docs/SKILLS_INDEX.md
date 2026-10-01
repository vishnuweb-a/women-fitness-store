# Skills Index

Inventory of every skill installed under `.agents/skills/`, resolved from disk
on 2026-10-02.

> **These skills are not loaded automatically.**
> Listing a skill here does nothing on its own. An agent must **open and read
> the `SKILL.md` file** (and any supporting files it names) before doing work
> the skill covers. Documenting a skill is not the same as applying it.

Paths are relative to the repository root.

## Applicable to storefront development

| Skill | `SKILL.md` path | Purpose | When to use | Prerequisites / checks |
|---|---|---|---|---|
| `reactjs` | [.agents/skills/reactjs/SKILL.md](../.agents/skills/reactjs/SKILL.md) | React component, hook, state, and form conventions. | Any React component or hook work. | None. Note: its TypeScript section does not apply — this project is JavaScript. |
| `vercel-react-best-practices` | [.agents/skills/vercel-react-best-practices/SKILL.md](../.agents/skills/vercel-react-best-practices/SKILL.md) | 70 performance rules: waterfalls, bundle size, re-renders. | Data fetching, bundle/perf work, component optimisation. | Rule detail lives in sibling reference files; read the specific rule before applying. Next.js-only rules do not apply. |
| `frontend-architect-reactjs_v19_nextjs_v15` | [.agents/skills/frontend-architect-reactjs_v19_nextjs_v15/SKILL.md](../.agents/skills/frontend-architect-reactjs_v19_nextjs_v15/SKILL.md) | React 19 APIs: `ref` as a prop, `useActionState`, `use()`. | React 19 patterns and form mutations. | **Partially applicable.** Written for Next.js 15 + TypeScript + Server Components. Only the React 19 client-side guidance applies; ignore Server Components, Server Actions, and `validate-v19.py` (it assumes `.tsx`). |
| `busirocket-tailwindcss-v4` | [.agents/skills/busirocket-tailwindcss-v4/SKILL.md](../.agents/skills/busirocket-tailwindcss-v4/SKILL.md) | Tailwind v4 setup and class strategy; avoiding style drift. | Writing component styles; deciding utility vs. custom CSS. | Read the named rule files in `rules/` (`tailwind-setup.md`, `tailwind-class-strategy.md`, `tailwind-avoid-drift.md`, `tailwind-css-ordering.md`). |
| `tailwindcss-fundamentals-v4` | [.agents/skills/tailwindcss-fundamentals-v4/SKILL.md](../.agents/skills/tailwindcss-fundamentals-v4/SKILL.md) | Tailwind v4 CSS-first config: `@theme`, `@utility`, `@custom-variant`, OKLCH, fluid type. | Changing design tokens or adding custom utilities/variants. | None. This is the primary Tailwind v4 reference for this project. |
| `tailwind-css-v4-shadcn-ui` | [.agents/skills/tailwind-css-v4-shadcn-ui/SKILL.md](../.agents/skills/tailwind-css-v4-shadcn-ui/SKILL.md) | Tailwind v4 combined with shadcn/ui; theming and `cn()`. | Adding or customising shadcn components. | Its examples are TypeScript (`.tsx`, `lib/utils.ts`); this project uses `.jsx` and `src/lib/utils.js`. |
| `tailwind-4-docs` | [.agents/skills/tailwind-4-docs/SKILL.md](../.agents/skills/tailwind-4-docs/SKILL.md) | Navigator for a local snapshot of the official Tailwind v4 docs. | Looking up exact utility/variant/config behaviour. | **Snapshot not initialised.** `references/docs/` does not exist; it requires running `scripts/sync_tailwind_docs.py --accept-docs-license` (network + licence acceptance). Until then use `references/gotchas.md` and `references/engineering-playbook.md`, or the official docs online. |
| `ui-styling` | [.agents/skills/ui-styling/SKILL.md](../.agents/skills/ui-styling/SKILL.md) | shadcn/ui + Tailwind patterns, accessible components, dark mode. | Building UI, layouts, and accessible interactive components. | Has `references/`, `scripts/`, and bundled `canvas-fonts/`. The canvas/poster portion is not relevant to storefront work. |
| `ui-ux-pro-max` | [.agents/skills/ui-ux-pro-max/SKILL.md](../.agents/skills/ui-ux-pro-max/SKILL.md) | Searchable UI/UX database: styles, palettes, font pairings, 119 UX guidelines. | Design decisions, UI review, accessibility/interaction QA. | Search script needs Python 3; invoke by full path. Read `references/quick-reference.md` on demand rather than wholesale. |
| `frontend-a11y` | [.agents/skills/frontend-a11y/SKILL.md](../.agents/skills/frontend-a11y/SKILL.md) | Accessibility: labels, ARIA, keyboard nav, focus management, reduced motion. | Forms, modals, dropdowns, any interactive component. | None. **Read before building any form or interactive control.** Its checklist is the review gate. |
| `framer-motion-react` | [.agents/skills/framer-motion-react/SKILL.md](../.agents/skills/framer-motion-react/SKILL.md) | `AnimatePresence`, layout animations, `useAnimation`, SSR notes. | Adding animation to React components. | **Outdated package name.** It says `npm install framer-motion` and imports from `"framer-motion"`. This project installs **`motion`** and imports from **`motion/react`** (the library was renamed). The patterns are still correct; only the import path differs. |
| `make-interfaces-feel-better` | [.agents/skills/make-interfaces-feel-better/SKILL.md](../.agents/skills/make-interfaces-feel-better/SKILL.md) | Interaction polish: perceived performance, micro-feedback, transitions. | Improving how an interface feels once it works. | None. |
| `frontend-design-direction` | [.agents/skills/frontend-design-direction/SKILL.md](../.agents/skills/frontend-design-direction/SKILL.md) | Choosing a deliberate visual direction over generic templates. | Starting a new page or raising the quality of existing UI. | None. |
| `design-philosophy` | [.agents/skills/design-philosophy/SKILL.md](../.agents/skills/design-philosophy/SKILL.md) | VS Code's Values → Principles → Moves vocabulary for UI critique. | Turning "this feels off" into a specific, principled fix. | Written for VS Code's own surfaces; use the reasoning method, not its literal tokens. |
| `image-to-code` | [.agents/skills/image-to-code/SKILL.md](../.agents/skills/image-to-code/SKILL.md) | Translating a visual reference into working markup. | Building screens from `pages/` reference images. | None. Directly relevant: all eight storefront screens exist only as images. |
| `supabase-postgres-best-practices` | [.agents/skills/supabase-postgres-best-practices/SKILL.md](../.agents/skills/supabase-postgres-best-practices/SKILL.md) | Postgres schema, RLS, indexing, query performance. | **Before** any table, column, migration, RLS policy, or query. | Rule detail is in `references/*.md`; read the specific rule file. Required reading for the schema phase. |

## Present but not applicable to ordinary storefront work

| Skill | `SKILL.md` path | Purpose | Why it is excluded |
|---|---|---|---|
| `frontend-slides` | [.agents/skills/frontend-slides/SKILL.md](../.agents/skills/frontend-slides/SKILL.md) | Builds self-contained HTML presentation decks. | Presentation tooling. Its "zero dependencies, single HTML file" rule directly conflicts with this React application. Use only if someone asks for a slide deck. |

## Reading order for common tasks

- **A new storefront screen** → `image-to-code`, `frontend-design-direction`,
  `ui-ux-pro-max`, `ui-styling`, `frontend-a11y`, then `reactjs`.
- **Styling or tokens** → `tailwindcss-fundamentals-v4`, then
  `busirocket-tailwindcss-v4`.
- **A form** → `frontend-a11y` first, then `reactjs`.
- **Animation** → `framer-motion-react` (remember: import from `motion/react`),
  then `make-interfaces-feel-better`.
- **Anything touching the database** → `supabase-postgres-best-practices`.
