/**
 * Validation schemas for the demo checkout.
 *
 * These check **format only**. Passing validation means the value looks like a
 * well-formed Indian address or phone number — it does **not** mean the
 * address exists, that delivery reaches it, or that the number is reachable.
 * Nothing in this build can verify any of that, and the UI says so in plain
 * language rather than implying a lookup happened.
 *
 * Every string field is trimmed before it is checked, so a value of spaces
 * fails `min(1)` instead of passing it.
 */
import { z } from 'zod'

/** Country is fixed for this phase: the catalog and prices are India-only. */
export const FIXED_COUNTRY = 'India'

/**
 * States and union territories, for the delivery/billing select.
 *
 * This is the administrative list. It is **not** a delivery-coverage list —
 * no coverage data exists in this build.
 */
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

/** Trim first, then validate — so "   " is empty, not a one-character name. */
const trimmed = () => z.string().trim()

/**
 * Indian mobile numbers, tolerant about how people actually type them.
 *
 * Accepts an optional `+91`/`91`/`0` prefix and any spaces or hyphens, then
 * requires ten digits starting 6-9. The normalised form is stored, so the
 * review step shows one consistent rendering regardless of what was typed.
 */
const PHONE_DIGITS = /^(?:\+?91|0)?([6-9]\d{9})$/

export function normalisePhone(value) {
  const compact = String(value ?? '').replace(/[\s()-]/g, '')
  const match = PHONE_DIGITS.exec(compact)
  return match ? match[1] : null
}

/** Format a stored ten-digit number for display: `+91 98765 43210`. */
export function formatPhone(tenDigits) {
  if (!/^\d{10}$/.test(String(tenDigits ?? ''))) return String(tenDigits ?? '')
  return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`
}

const phoneField = trimmed()
  .min(1, 'Enter a phone number.')
  .refine((value) => normalisePhone(value) !== null, {
    message: 'Enter a 10-digit Indian mobile number, starting 6, 7, 8 or 9.',
  })
  .transform((value) => normalisePhone(value))

/**
 * Six digits, first digit 1-9 — the structural rule for an Indian PIN code.
 * A well-formed PIN is not a serviceable PIN; no coverage data exists here.
 */
const postalCodeField = trimmed()
  .regex(/^[1-9]\d{5}$/, 'Enter a 6-digit PIN code.')

/** Address fields shared by the delivery and billing forms. */
export const addressSchema = z.object({
  firstName: trimmed().min(1, 'Enter a first name.').max(60, 'Use 60 characters or fewer.'),
  lastName: trimmed().min(1, 'Enter a last name.').max(60, 'Use 60 characters or fewer.'),
  addressLine1: trimmed()
    .min(1, 'Enter a house or building and street.')
    .max(120, 'Use 120 characters or fewer.'),
  addressLine2: trimmed().max(120, 'Use 120 characters or fewer.').optional().default(''),
  city: trimmed().min(1, 'Enter a city.').max(60, 'Use 60 characters or fewer.'),
  state: trimmed().min(1, 'Select a state or union territory.'),
  postalCode: postalCodeField,
  country: z.literal(FIXED_COUNTRY).default(FIXED_COUNTRY),
})

/** Step 1 — contact details plus the delivery address. */
export const deliverySchema = addressSchema.extend({
  email: trimmed()
    .min(1, 'Enter an email address.')
    .email('Enter a valid email address, like you@example.com.'),
  phone: phoneField,
})

/**
 * Step 2 — billing.
 *
 * When `sameAsDelivery` is true the alternate form is not rendered, so its
 * fields must not block progression. The billing address is **derived** from
 * the live delivery address at review time rather than copied here, which is
 * what keeps an edited delivery address from leaving a stale billing copy
 * behind.
 */
export const billingSchema = z
  .object({
    sameAsDelivery: z.boolean(),
    /**
     * Unvalidated here on purpose. React Hook Form keeps the alternate form's
     * values in state even while it is unmounted, so a half-filled hidden form
     * would otherwise fail its own field rules and block a person who chose
     * "same as delivery" — with the errors attached to inputs that are not on
     * screen to fix. The `superRefine` below is the only gate, and it runs
     * only when the form is actually shown.
     */
    billingAddress: z.unknown().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.sameAsDelivery) return

    const result = addressSchema.safeParse(value.billingAddress ?? {})

    if (result.success) return

    for (const issue of result.error.issues) {
      ctx.addIssue({
        code: 'custom',
        path: ['billingAddress', ...issue.path],
        message: issue.message,
      })
    }
  })
  /**
   * Replace the raw billing input with the parsed, trimmed address.
   *
   * `z.unknown()` passes its input through untouched, so without this the
   * billing address would keep whatever whitespace was typed while the
   * delivery address was trimmed — and the two would render differently on
   * the review step for what the person entered as the same address.
   *
   * This runs only after `superRefine` has passed, so the parse cannot fail
   * here. When "same as delivery" is selected the field is dropped entirely:
   * the address is derived from the live delivery address instead, and a copy
   * left behind in state is exactly the staleness this flow must not have.
   */
  .transform((value) => {
    if (value.sameAsDelivery) {
      return { sameAsDelivery: true, billingAddress: null }
    }
    return {
      sameAsDelivery: false,
      billingAddress: addressSchema.parse(value.billingAddress ?? {}),
    }
  })

/** The demo payment-method preferences offered in this phase. */
export const PAYMENT_METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    description: 'Pay by UPI app or ID when payments are connected.',
  },
  {
    id: 'card',
    label: 'Credit or debit card',
    description: 'Pay by card when payments are connected.',
  },
  {
    id: 'netbanking',
    label: 'Net banking',
    description: 'Pay from a bank account when payments are connected.',
  },
]

export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map((method) => method.id)

export function getPaymentMethodLabel(id) {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? null
}

/** Step 2, combined: billing address plus the chosen demo method preference. */
export const paymentSchema = z.intersection(
  billingSchema,
  z.object({
    paymentMethod: z.enum(PAYMENT_METHOD_IDS, {
      message: 'Select a payment method to continue.',
    }),
  }),
)

/**
 * Resolve the effective billing address.
 *
 * Derived on demand from whichever delivery address is current, so editing
 * delivery after choosing "same as delivery" cannot leave a stale copy.
 */
export function resolveBillingAddress({ delivery, billing }) {
  if (!delivery) return null
  if (!billing || billing.sameAsDelivery !== false) {
    const { email: _email, phone: _phone, ...address } = delivery
    return address
  }
  return billing.billingAddress ?? null
}

/** Default values for an address sub-form. */
export const emptyAddress = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: FIXED_COUNTRY,
}
