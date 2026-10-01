import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Quantity control shared by the product page and the cart.
 *
 * A real number `<input>` sits between the two buttons, so the value can be
 * typed as well as stepped, and the control reports its own value to assistive
 * technology without an `aria-live` region. The buttons are 44px targets.
 *
 * `label` names what is being counted ("Premium Grip Yoga Mat"), which keeps
 * every control on a cart page distinguishable from the others.
 *
 * The value is clamped by the caller's `onChange`; the input only ever reports
 * a parsed integer, and an unparseable entry is ignored rather than written as
 * `NaN`.
 */
export function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 99,
  inputId,
  className,
}) {
  function commit(next) {
    if (!Number.isFinite(next)) return
    onChange(Math.max(min, Math.min(Math.round(next), max)))
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-control border border-border',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => commit(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
        className="inline-flex size-11 items-center justify-center rounded-l-control text-ink-700 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus className="size-4" aria-hidden="true" focusable="false" />
      </button>

      <label htmlFor={inputId} className="sr-only">
        Quantity of {label}
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10)
          if (Number.isFinite(parsed)) commit(parsed)
        }}
        className="h-11 w-12 border-x border-border bg-transparent text-center text-sm tabular-nums text-ink-900 [appearance:textfield] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={() => commit(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
        className="inline-flex size-11 items-center justify-center rounded-r-control text-ink-700 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden="true" focusable="false" />
      </button>
    </div>
  )
}
