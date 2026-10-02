/**
 * Validation for the session-only customer previews.
 *
 * Format checks only, exactly as in `checkout-schema.js`: a passing email has
 * a plausible shape, it is not known to exist or to be reachable. Nothing in
 * this build can verify any of it.
 *
 * The address rules are **reused** from the checkout schema rather than
 * restated, so the two never drift apart — one PIN-code rule, one state list,
 * one phone normalisation. Only the label field is new here.
 */
import { z } from 'zod'

import { addressSchema, normalisePhone } from '@/features/checkout/checkout-schema'

const trimmed = () => z.string().trim()

/**
 * Profile preview.
 *
 * Deliberately four fields. No password, no date of birth, no gender, and no
 * "security question": there is no account to secure, nothing is stored, and
 * collecting a credential or a birth date to echo it back on the same screen
 * would be gathering sensitive data for no purpose at all.
 */
export const profileSchema = z.object({
  firstName: trimmed().min(1, 'Enter a first name.').max(60, 'Use 60 characters or fewer.'),
  lastName: trimmed().min(1, 'Enter a last name.').max(60, 'Use 60 characters or fewer.'),
  email: trimmed()
    .min(1, 'Enter an email address.')
    .email('Enter a valid email address, like you@example.com.'),
  phone: trimmed()
    .min(1, 'Enter a phone number.')
    .refine((value) => normalisePhone(value) !== null, {
      message: 'Enter a 10-digit Indian mobile number, starting 6, 7, 8 or 9.',
    })
    .transform((value) => normalisePhone(value)),
})

/** How an address preview is named in the list. */
export const ADDRESS_LABEL_KINDS = ['Home', 'Work', 'custom']

/**
 * An address preview: a chosen label plus the shared address fields.
 *
 * `customLabel` is only required when the label kind is `custom`, and is
 * checked in `superRefine` so an abandoned value in the hidden field cannot
 * block the form — the same trap the billing form hit in Phase 3.
 */
export const addressPreviewSchema = addressSchema
  .extend({
    labelKind: z.enum(ADDRESS_LABEL_KINDS, { message: 'Choose a label for this address.' }),
    customLabel: trimmed().max(30, 'Use 30 characters or fewer.').optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.labelKind !== 'custom') return
    if (!value.customLabel) {
      ctx.addIssue({
        code: 'custom',
        path: ['customLabel'],
        message: 'Enter a label for this address.',
      })
    }
  })

/**
 * The label to display for a submitted address preview.
 *
 * Kept beside the schema because it is the other half of the same rule: what
 * `labelKind` plus `customLabel` actually mean.
 */
export function resolveAddressLabel({ labelKind, customLabel }) {
  return labelKind === 'custom' ? String(customLabel ?? '').trim() : labelKind
}

/** Default values for the address preview form. */
export const emptyAddressPreview = {
  labelKind: 'Home',
  customLabel: '',
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
}
