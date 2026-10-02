import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FIXED_COUNTRY, INDIAN_STATES } from '@/features/checkout/checkout-schema'
import { cn } from '@/lib/utils'

/**
 * One labelled field with its error wired up.
 *
 * Every field goes through here so the three things that are easy to forget —
 * `htmlFor`/`id` pairing, `aria-invalid`, and an `aria-describedby` that
 * points at both the hint and the error — are done once rather than per input.
 *
 * `register` is spread onto the control, so this works for both the delivery
 * and billing forms without either knowing the other's field prefix.
 */
export function Field({
  id,
  label,
  error,
  hint,
  optional = false,
  className,
  children,
}) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="font-normal text-muted-foreground">(optional)</span>
        ) : (
          <span aria-hidden="true" className="text-brand-600">
            *
          </span>
        )}
      </Label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
        'aria-required': optional ? undefined : true,
      })}

      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground text-pretty">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-brand-600">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * The address block shared by the delivery and billing forms.
 *
 * `prefix` namespaces the registered field names (`''` for delivery,
 * `billingAddress.` for billing) and the DOM ids, so both forms can appear in
 * one document without colliding.
 *
 * Country is fixed to India for this phase: the catalog is priced in INR and
 * nothing in this build can quote a cross-border shipment. It is rendered as a
 * disabled control with a real hidden value rather than omitted, so the person
 * can see what was assumed.
 */
export function AddressFields({ register, errors, prefix = '', idPrefix }) {
  const name = (field) => `${prefix}${field}`
  const id = (field) => `${idPrefix}-${field}`
  const errorOf = (field) => errors?.[field]?.message

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id={id('firstName')} label="First name" error={errorOf('firstName')}>
        {(a11y) => (
          <Input
            {...a11y}
            {...register(name('firstName'))}
            type="text"
            autoComplete="given-name"
            autoCapitalize="words"
            className="min-h-11"
          />
        )}
      </Field>

      <Field id={id('lastName')} label="Last name" error={errorOf('lastName')}>
        {(a11y) => (
          <Input
            {...a11y}
            {...register(name('lastName'))}
            type="text"
            autoComplete="family-name"
            autoCapitalize="words"
            className="min-h-11"
          />
        )}
      </Field>

      <Field
        id={id('addressLine1')}
        label="Address line 1"
        error={errorOf('addressLine1')}
        className="sm:col-span-2"
      >
        {(a11y) => (
          <Input
            {...a11y}
            {...register(name('addressLine1'))}
            type="text"
            autoComplete="address-line1"
            placeholder="House or flat number, building, street"
            className="min-h-11"
          />
        )}
      </Field>

      <Field
        id={id('addressLine2')}
        label="Address line 2"
        optional
        error={errorOf('addressLine2')}
        className="sm:col-span-2"
      >
        {(a11y) => (
          <Input
            {...a11y}
            {...register(name('addressLine2'))}
            type="text"
            autoComplete="address-line2"
            placeholder="Apartment, floor, landmark"
            className="min-h-11"
          />
        )}
      </Field>

      <Field id={id('city')} label="City" error={errorOf('city')}>
        {(a11y) => (
          <Input
            {...a11y}
            {...register(name('city'))}
            type="text"
            autoComplete="address-level2"
            autoCapitalize="words"
            className="min-h-11"
          />
        )}
      </Field>

      <Field id={id('state')} label="State or union territory" error={errorOf('state')}>
        {(a11y) => (
          <select
            {...a11y}
            {...register(name('state'))}
            autoComplete="address-level1"
            className="min-h-11 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm"
          >
            <option value="">Select a state or union territory</option>
            {INDIAN_STATES.map((stateName) => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field
        id={id('postalCode')}
        label="PIN code"
        error={errorOf('postalCode')}
        hint="Six digits. The format is checked here; delivery coverage is not."
      >
        {(a11y) => (
          <Input
            {...a11y}
            {...register(name('postalCode'))}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            className="min-h-11"
          />
        )}
      </Field>

      <Field
        id={id('country')}
        label="Country"
        error={errorOf('country')}
        hint={`Fixed to ${FIXED_COUNTRY} for this phase — the catalog is priced in INR only.`}
      >
        {(a11y) => (
          <Input
            {...a11y}
            {...register(name('country'))}
            type="text"
            autoComplete="country-name"
            readOnly
            aria-readonly="true"
            className="min-h-11 bg-muted text-muted-foreground"
          />
        )}
      </Field>
    </div>
  )
}
