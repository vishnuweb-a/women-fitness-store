import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useReducedMotion } from 'motion/react'
import { Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddressFields, Field } from '@/features/checkout/address-fields'
import { CheckoutBlocked, UnavailableLinesNotice } from '@/features/checkout/checkout-guards'
import { CheckoutLayout } from '@/features/checkout/checkout-layout'
import { deliverySchema, emptyAddress } from '@/features/checkout/checkout-schema'
import { CheckoutSummary } from '@/features/checkout/checkout-summary'
import { resolveStepAccess } from '@/features/checkout/checkout-state'
import { useCheckoutSession } from '@/features/checkout/use-checkout'

/**
 * Step 1 — contact details and the delivery address.
 *
 * Follows reference screen 06, with the parts this build cannot support
 * removed rather than faked:
 *
 *   - **No delivery-method choice and no delivery dates.** The reference
 *     offers "Standard 5-7 Oct, FREE" and "Express, ₹99". No shipping rates,
 *     carriers, or lead times exist anywhere in this project, so both options
 *     and both dates would be inventions. The page states that shipping is
 *     confirmed when the backend is connected.
 *   - **No coupon field.** No promotion exists to apply.
 *   - **No grand total.** Shipping and tax are not calculated.
 *
 * Values are held in the in-memory checkout draft, so returning from the
 * billing step restores every field. Nothing entered here is written to
 * `localStorage`, the URL, or the cart storage.
 */
export function CheckoutPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const {
    state,
    setDelivery,
    cartItems,
    unavailableItems,
    cartCount,
    cartSubtotalPaise,
    signature,
    hasCartItems,
  } = useCheckoutSession()

  const access = resolveStepAccess({ step: 'delivery', state, hasCartItems })

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitted },
  } = useForm({
    resolver: zodResolver(deliverySchema),
    mode: 'onSubmit',
    // The draft is the source of truth for a return visit; without one the
    // form starts empty with only the fixed country filled in.
    defaultValues: state.delivery ?? { ...emptyAddress, email: '', phone: '' },
  })

  /**
   * Move focus to the first field that failed.
   *
   * React Hook Form's own `shouldFocusError` misses the `select`, and the
   * field order it uses is registration order rather than visual order. Doing
   * it explicitly against the schema's field order keeps focus landing where
   * the eye does.
   */
  const fieldOrder = [
    'email',
    'phone',
    'firstName',
    'lastName',
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'postalCode',
  ]

  function focusFirstError(fieldErrors) {
    const first = fieldOrder.find((field) => fieldErrors[field])
    if (first) setFocus(first)
  }

  function onValid(values) {
    setDelivery(values, signature)
    navigate('/checkout/payment')
  }

  if (!access.allowed) {
    return (
      <CheckoutBlocked
        title="Nothing to check out"
        reason={access.reason}
        primaryTo={access.redirectTo}
        primaryLabel="Go to your bag"
      />
    )
  }

  const blockedByUnavailable = unavailableItems.length > 0

  return (
    <CheckoutLayout
      step="delivery"
      title="Delivery information"
      description="Enter the contact and delivery details this demo checkout should show on its review step."
      summary={
        <CheckoutSummary
          items={cartItems}
          count={cartCount}
          subtotalPaise={cartSubtotalPaise}
        />
      }
    >
      {blockedByUnavailable && (
        <div className="mb-6">
          <UnavailableLinesNotice count={unavailableItems.length} />
        </div>
      )}

      <motion.form
        noValidate
        onSubmit={handleSubmit(onValid, focusFirstError)}
        initial={reduceMotion ? false : { y: 8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-8"
      >
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="font-display text-lg font-bold uppercase tracking-tight">
            Contact details
          </legend>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Used only to fill in this demo checkout. Nothing is sent anywhere and
            nothing is stored outside this browser tab.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="delivery-email" label="Email address" error={errors.email?.message}>
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('email')}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  placeholder="you@example.com"
                  className="min-h-11"
                />
              )}
            </Field>

            <Field
              id="delivery-phone"
              label="Phone number"
              error={errors.phone?.message}
              hint="Indian mobile number. +91, 0, spaces, and hyphens are all accepted."
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('phone')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  className="min-h-11"
                />
              )}
            </Field>
          </div>
        </fieldset>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="font-display text-lg font-bold uppercase tracking-tight">
            Delivery address
          </legend>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Checked for format only. Whether this address can actually be delivered
            to is not verified in this build.
          </p>

          <div className="mt-4">
            <AddressFields register={register} errors={errors} idPrefix="delivery" />
          </div>
        </fieldset>

        {/*
          The reference offers Standard and Express delivery with dates and
          prices. There is no shipping data in this project — no rates, no
          carriers, no lead times — so offering a choice here would be
          fabricating the one thing the person would most reasonably rely on.
        */}
        <p className="flex gap-2 rounded-card border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" focusable="false" />
          <span className="text-pretty">
            No delivery options, dates, or shipping charges are shown. This build has
            no shipping data, so any speed, price, or arrival date would be invented.
            These are confirmed once the backend is connected.
          </span>
        </p>

        {/* Announced once after a failed submit; the per-field messages carry
            the detail, so this only reports that something needs attention. */}
        <p role="status" aria-live="polite" className="sr-only">
          {isSubmitted && Object.keys(errors).length > 0
            ? `${Object.keys(errors).length} ${
                Object.keys(errors).length === 1 ? 'field needs' : 'fields need'
              } attention before you can continue.`
            : ''}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" className="min-h-11" disabled={blockedByUnavailable}>
            Continue to billing
          </Button>
          <span className="text-xs text-muted-foreground">
            No payment is taken at any step.
          </span>
        </div>
      </motion.form>
    </CheckoutLayout>
  )
}
