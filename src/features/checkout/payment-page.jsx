import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { AddressFields } from '@/features/checkout/address-fields'
import { AddressSummary } from '@/features/checkout/address-summary'
import {
  CartChangedNotice,
  CheckoutBlocked,
  UnavailableLinesNotice,
} from '@/features/checkout/checkout-guards'
import { CheckoutLayout } from '@/features/checkout/checkout-layout'
import {
  emptyAddress,
  paymentSchema,
  resolveBillingAddress,
} from '@/features/checkout/checkout-schema'
import { CheckoutSummary } from '@/features/checkout/checkout-summary'
import { resolveStepAccess } from '@/features/checkout/checkout-state'
import { CheckoutReview } from '@/features/checkout/checkout-review'
import { PaymentMethodGroup } from '@/features/checkout/payment-method-group'
import { useCheckoutSession } from '@/features/checkout/use-checkout'

/**
 * Step 2 — billing address, demo payment-method preference, then review.
 *
 * Follows reference screen 07 with its payment-credential block removed: the
 * reference collects a cardholder name, card number, expiry, and CVV, and this
 * build collects none of them. No provider is integrated, so a form shaped like
 * a card form would be collecting real card data into a page with nowhere safe
 * to send it. The "Pay ₹4,298" button, the lock iconography, and the
 * "encrypted and secure" reassurance are gone for the same reason — none of it
 * would be true.
 *
 * The page has two modes in one route: the billing/method form, and the review
 * it reveals once that form validates. Review is a mode rather than a third
 * route because its content is entirely derived — there is no step state to
 * guard, and a reload would lose the draft either way.
 */
export function PaymentPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const {
    state,
    setPayment,
    acknowledgeCartChange,
    completeDemoCheckout,
    cartItems,
    unavailableItems,
    cartCount,
    cartSubtotalPaise,
    signature,
    hasCartItems,
    reviewStale,
  } = useCheckoutSession()

  const [reviewRequested, setReviewRequested] = useState(false)

  const access = resolveStepAccess({ step: 'payment', state, hasCartItems })

  const {
    register,
    control,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    mode: 'onSubmit',
    defaultValues: {
      sameAsDelivery: state.billing?.sameAsDelivery ?? true,
      billingAddress: state.billing?.billingAddress ?? emptyAddress,
      paymentMethod: state.paymentMethod ?? '',
    },
  })

  const sameAsDelivery = useWatch({ control, name: 'sameAsDelivery' })
  const paymentMethod = useWatch({ control, name: 'paymentMethod' })

  /**
   * A cart change invalidates the review.
   *
   * Derived at render rather than reset from an effect: a stale review simply
   * is not a review, so `reviewing` is a function of the request **and** the
   * cart still matching. Writing `setReviewing(false)` from an effect would
   * render the stale review once before retracting it — exactly the frame in
   * which someone could press Complete.
   *
   * The summary beside the form has already refreshed, since it reads the live
   * cart; dropping back to the form is what forces the updated items to be
   * looked at again before completion.
   */
  const reviewing = reviewRequested && !reviewStale


  function focusFirstError(fieldErrors) {
    if (fieldErrors.billingAddress) {
      const order = [
        'firstName',
        'lastName',
        'addressLine1',
        'addressLine2',
        'city',
        'state',
        'postalCode',
      ]
      const first = order.find((field) => fieldErrors.billingAddress[field])
      if (first) {
        setFocus(`billingAddress.${first}`)
        return
      }
    }
    if (fieldErrors.paymentMethod) {
      document.getElementById('payment-method-upi')?.focus()
    }
  }

  function onValid(values) {
    // The schema has already nulled `billingAddress` when "same as delivery"
    // is selected, so only the flag is stored in that case. The address is
    // then derived from the live delivery address at render time, and a later
    // edit to delivery cannot leave a stale copy behind here.
    setPayment(
      { sameAsDelivery: values.sameAsDelivery, billingAddress: values.billingAddress },
      values.paymentMethod,
    )
    setReviewRequested(true)
  }

  function handleComplete() {
    const billingAddress = resolveBillingAddress({
      delivery: state.delivery,
      billing: {
        sameAsDelivery,
        billingAddress: sameAsDelivery ? null : state.billing?.billingAddress,
      },
    })

    const snapshot = completeDemoCheckout({
      cartItems,
      delivery: state.delivery,
      billingAddress,
      paymentMethod,
    })

    navigate(`/orders/${snapshot.reference}/confirmation`)
  }

  if (!access.allowed) {
    return (
      <CheckoutBlocked
        title={hasCartItems ? 'Delivery details needed' : 'Nothing to check out'}
        reason={access.reason}
        primaryTo={access.redirectTo}
        primaryLabel={hasCartItems ? 'Enter delivery details' : 'Go to your bag'}
      />
    )
  }

  const blockedByUnavailable = unavailableItems.length > 0

  // Derived on every render from whatever the delivery address currently is.
  const billingPreview = resolveBillingAddress({
    delivery: state.delivery,
    billing: { sameAsDelivery, billingAddress: null },
  })

  return (
    <CheckoutLayout
      step="payment"
      title={reviewing ? 'Review demo order' : 'Billing and payment'}
      description={
        reviewing
          ? 'Check everything below, then complete the demo checkout. No order is created and no payment is taken.'
          : 'Confirm the billing address and choose a demo payment-method preference.'
      }
      summary={
        <CheckoutSummary
          items={cartItems}
          count={cartCount}
          subtotalPaise={cartSubtotalPaise}
        />
      }
    >
      <div className="flex flex-col gap-6">
        {blockedByUnavailable && <UnavailableLinesNotice count={unavailableItems.length} />}

        {reviewStale && (
          <CartChangedNotice onAcknowledge={() => acknowledgeCartChange(signature)} />
        )}

        <AddressSummary
          heading="Delivery address"
          headingId="review-delivery-address"
          address={state.delivery}
          contact={{ email: state.delivery.email, phone: state.delivery.phone }}
          editTo="/checkout"
          editLabel="delivery and contact details"
          as="h2"
        />

        <AnimatePresence initial={false} mode="wait">
          {reviewing ? (
            <motion.div
              key="review"
              initial={reduceMotion ? false : { opacity: 1, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 1, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <CheckoutReview
                items={cartItems}
                count={cartCount}
                subtotalPaise={cartSubtotalPaise}
                delivery={state.delivery}
                billingAddress={resolveBillingAddress({
                  delivery: state.delivery,
                  billing: state.billing,
                })}
                paymentMethod={paymentMethod}
                blocked={blockedByUnavailable || reviewStale}
                onBack={() => setReviewRequested(false)}
                onComplete={handleComplete}
              />
            </motion.div>
          ) : (
            <motion.form
              key="form"
              noValidate
              onSubmit={handleSubmit(onValid, focusFirstError)}
              initial={reduceMotion ? false : { opacity: 1, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 1, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-8"
            >
              <fieldset className="min-w-0 border-0 p-0">
                <legend className="font-display text-lg font-bold uppercase tracking-tight">
                  Billing address
                </legend>

                <label
                  htmlFor="billing-same"
                  className="mt-3 flex cursor-pointer items-start gap-3 rounded-card border border-border p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                >
                  <input
                    id="billing-same"
                    type="checkbox"
                    {...register('sameAsDelivery')}
                    className="mt-0.5 size-4 shrink-0 accent-brand-500"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      Billing address is the same as delivery
                    </span>
                    <span className="block text-xs text-muted-foreground text-pretty">
                      The billing address follows your delivery address, including any
                      later edit to it.
                    </span>
                  </span>
                </label>

                {sameAsDelivery ? (
                  <AddressSummary
                    heading="Billing address"
                    headingId="billing-derived"
                    address={billingPreview}
                    editTo="/checkout"
                    editLabel="the delivery address this follows"
                    className="mt-4 bg-muted/50"
                    // h2, not h3: a `legend` is not a heading, so there is no
                    // h2 between this and the page h1 to nest under.
                    as="h2"
                  />
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground text-pretty">
                      Checked for format only, exactly as the delivery address is.
                    </p>
                    <div className="mt-4">
                      <AddressFields
                        register={register}
                        errors={errors.billingAddress}
                        prefix="billingAddress."
                        idPrefix="billing"
                      />
                    </div>
                  </div>
                )}
              </fieldset>

              <PaymentMethodGroup control={control} error={errors.paymentMethod?.message} />

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="lg" className="min-h-11" disabled={blockedByUnavailable}>
                  Review demo order
                </Button>
                <span className="text-xs text-muted-foreground">
                  Nothing is charged and no order is created.
                </span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </CheckoutLayout>
  )
}
