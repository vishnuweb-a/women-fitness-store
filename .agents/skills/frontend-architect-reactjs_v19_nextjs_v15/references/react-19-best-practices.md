# React 19 Best Practices & Migration Guide

This document details the fundamental changes in React 19 and how to implement them correctly.

## 1. The End of `forwardRef`
In React 19, `ref` is now a common prop. It is no longer necessary to wrap components in `forwardRef`.

**Before (v18):**
```tsx
const MyInput = forwardRef((props, ref) => (
  <input {...props} ref={ref} />
));
```

**Now (v19):**
```tsx
const MyInput = ({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & Props) => (
  <input {...props} ref={ref} />
);
```

## 2. New Form and Action APIs

### `useActionState`
Replaces `useFormState` (from the experimental phase). It is the standard hook for handling the state of a Server Action.

- Returns: `[state, formAction, isPending]`.
- Simplifies error management and loading states without manual `useState`.

### `useFormStatus`
Allows child components of a `<form>` to access information about the current submission (such as `pending`).

## 3. `useOptimistic`
Allows showing an "optimistic" state in the interface while an asynchronous operation (like a Server Action) is still processing.

## 4. The `use()` API
A new API to consume resources declaratively within `render`.
- Can be used to read Promises or Context.
- Unlike other hooks, it can be called inside conditionals and loops (in specific Context cases).

## 5. Server Components & Actions (Next.js 15)
- **Server Components**: Components are Server Components by default. Use `"use client"` only when necessary (interactivity, client hooks).
- **Server Actions**: Asynchronous functions marked with `"use server"` that can be called directly from the client.

---
See the templates in the `assets/` folder for practical examples.
