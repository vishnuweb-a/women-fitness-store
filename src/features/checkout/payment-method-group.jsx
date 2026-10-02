import { Controller } from 'react-hook-form'
import { Banknote, CreditCard, Smartphone } from 'lucide-react'

import { PAYMENT_METHODS } from '@/features/checkout/checkout-schema'
import { cn } from '@/lib/utils'

const METHOD_ICONS = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Banknote,
}

/**
 * Demo payment-method preference.
 *
 * Native radio inputs inside a `radiogroup` fieldset, styled as cards. The
 * input is the control — not a `div` with `role="radio"` — so arrow-key
 * roving, Space activation, and the grouped announcement all come from the
 * browser rather than from re-implemented key handling.
 *
 * **These are preferences, not supported payment methods.** No provider is
 * integrated, so nothing here is confirmed to work. No credential field is
 * rendered anywhere: the reference screen collects a cardholder name, card
 * number, expiry, and CVV, and this build collects none of them — a form that
 * looks like it takes card details, in a project with no payment processor and
 * no PCI boundary, is a trap regardless of what happens to the value.
 */
export function PaymentMethodGroup({ control, error }) {
  const errorId = 'payment-method-error'

  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="font-display text-lg font-bold uppercase tracking-tight">
        Payment method
      </legend>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">
        Choose the method this demo checkout should record as your preference.
        No payment is set up, nothing is charged, and no provider is contacted.
      </p>

      <Controller
        name="paymentMethod"
        control={control}
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-label="Demo payment method preference"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            aria-required="true"
            className="mt-4 grid gap-3 sm:grid-cols-3"
          >
            {PAYMENT_METHODS.map((method) => {
              const Icon = METHOD_ICONS[method.id]
              const checked = field.value === method.id
              const inputId = `payment-method-${method.id}`

              return (
                <label
                  key={method.id}
                  htmlFor={inputId}
                  className={cn(
                    'flex cursor-pointer flex-col gap-2 rounded-card border-2 p-4 transition-colors',
                    'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                    checked
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-border bg-background hover:border-ink-300',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      id={inputId}
                      type="radio"
                      name={field.name}
                      value={method.id}
                      checked={checked}
                      onChange={() => field.onChange(method.id)}
                      onBlur={field.onBlur}
                      className="size-4 shrink-0 accent-brand-500"
                    />
                    <Icon
                      className={cn(
                        'size-5 shrink-0',
                        checked ? 'text-brand-600' : 'text-muted-foreground',
                      )}
                      aria-hidden="true"
                      focusable="false"
                    />
                    <span className="text-sm font-semibold">{method.label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground text-pretty">
                    {method.description}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      />

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs font-medium text-brand-600">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground text-pretty">
        No card number, expiry, CVV, UPI ID, or bank login is collected anywhere in
        this flow, and none of these methods is confirmed as supported.
      </p>
    </fieldset>
  )
}
