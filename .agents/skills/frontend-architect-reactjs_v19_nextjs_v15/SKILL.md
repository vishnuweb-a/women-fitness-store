---
name: frontend-architect-Reactjs_v19_Nextjs_v15
description: Use this skill when building or refactoring modern frontends with React 19 and Next.js 15. It provides instructions for Server Components, Server Actions, and new React 19 APIs like useActionState and direct ref props.
---

# Frontend Architect React V19 Skill

This skill guides the implementation of high-performance frontend architectures using the latest APIs from the React and Next.js ecosystem.

## When to Use
- When starting a new project or component in Next.js 15+.
- When migrating components from React 18 to React 19.
- When implementing complex forms with data mutations (Server Actions).
- When seeking functional design patterns and strict typing.

## Code Principles
1. **Server Components by Default**: Keep data fetching logic on the server whenever possible.
2. **Immutability**: Use functional patterns for data transformation.
3. **Actions over Effects**: Prefer Server Actions and `useActionState` over `useEffect` for mutations.
4. **Composition**: Build UIs through small, focused, and reusable components.
5. **Progressive Typing**: Use TypeScript to ensure compile-time safety, especially for Props and Actions.

## Workflow Checklist
- [ ] **Analyze**: Determine if the component should be a Server or Client component.
- [ ] **Implementation**: Use React 19 patterns (direct `ref`, `useActionState`).
- [ ] **Validation**: Run the validation script `python3 scripts/validate-v19.py <file>`.
- [ ] **Refinement**: Ensure styling uses the `cn()` utility for dynamic Tailwind class merging.

## Gotchas
- **`forwardRef` is deprecated**: Do not use it. Pass `ref` as a standard prop.
- **`useFormState` is now `useActionState`**: Ensure you use the updated hook name and signature.
- **Client Directives**: Remember that `"use client"` is only needed for interactivity or browser-only APIs.
- **Tailwind Conflicts**: Always use `cn()` from `src/lib/utils.ts` to prevent class collision issues.

## Quality Checklist V19
- [ ] Does the component use `ref` as a direct prop (no `forwardRef`)?
- [ ] Do forms use `useActionState` to manage pending and error states?
- [ ] Is immediate visual feedback implemented with `useOptimistic`?
- [ ] are asynchronous resources (Promises/Context) consumed via the `use()` API?
- [ ] Does styling use `cn()` for dynamic Tailwind class merging?

---
For in-depth technical details, see [React 19 Best Practices](./references/react-19-best-practices.md).
