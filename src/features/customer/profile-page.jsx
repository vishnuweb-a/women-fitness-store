/**
 * Profile preview.
 *
 * Four fields — name, email, phone — held in memory for one session. The
 * action is labelled "Apply to preview", not "Save": nothing is saved, and a
 * button that says so would be the single most misleading word on the page.
 *
 * ## What is deliberately absent
 *
 *   - **No password field.** There is no account to secure and no credential
 *     store to put one in. Collecting a password here would be gathering a
 *     reused secret for no purpose.
 *   - **No date of birth, gender, or marketing preferences.** Nothing in this
 *     build acts on them, so asking for them would be collection without use.
 *   - **No avatar upload.** No file storage exists.
 *
 * ## Independence from checkout
 *
 * This state is not read by checkout and does not write to it. Copying a
 * preview into the checkout draft is offered as an explicit action elsewhere
 * or not at all — it never happens silently, because a value typed into a
 * preview quietly becoming the address a demo checkout runs against is
 * exactly the surprise this separation prevents.
 */
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, UserRound } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field } from '@/features/checkout/address-fields'
import { formatPhone } from '@/features/checkout/checkout-schema'
import { CustomerLayout } from '@/features/customer/customer-layout'
import { emptyProfile } from '@/features/customer/customer-state'
import { profileSchema } from '@/features/customer/customer-schema'
import { useCustomer } from '@/features/customer/use-customer'

export function ProfilePage() {
  const { profile, setProfile, clearProfile } = useCustomer()
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState(null)
  const editButtonRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profile ?? emptyProfile,
    mode: 'onSubmit',
  })

  function openEditor() {
    reset(profile ?? emptyProfile)
    setStatus(null)
    setEditing(true)
  }

  /**
   * Close the form and return focus to the Edit button.
   *
   * The button is unmounted while the form is open, so focus would otherwise
   * fall to `body` on cancel or apply — the same restoration a dialog owes
   * its trigger. `flushSync` commits the unmount before the focus call, so
   * the button exists to receive it; doing this from an effect instead would
   * mean a setState in an effect body and a cascading render.
   */
  function closeEditor() {
    flushSync(() => setEditing(false))
    editButtonRef.current?.focus()
  }

  function onSubmit(values) {
    setProfile(values)
    setStatus('Profile preview updated for this session.')
    closeEditor()
  }

  /**
   * Move focus to the first invalid field.
   *
   * Without this, submitting an invalid form leaves focus on the submit
   * button while the errors appear above it — a keyboard user has to hunt
   * back up the form to find what failed.
   */
  function onInvalid(fieldErrors) {
    const first = ['firstName', 'lastName', 'email', 'phone'].find((name) => fieldErrors[name])
    if (first) setFocus(first)
  }

  function handleClear() {
    clearProfile()
    reset(emptyProfile)
    setStatus('Profile preview cleared.')
  }

  return (
    <CustomerLayout
      title="Profile preview"
      description="Try the details an account profile would hold. This is a preview: nothing is saved and no account exists."
    >
      {/*
        One always-present polite live region, so the result is announced once
        rather than the region being announced as it mounts and again as it
        fills — the same pattern as the product page's add-to-bag status.
      */}
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-medium text-success">
        {status}
      </p>

      {editing ? (
        <form
          // Wrapped rather than passed directly: `handleSubmit(...)` is called
          // during render, and `onSubmit` closes over the focus ref.
          onSubmit={(event) => handleSubmit(onSubmit, onInvalid)(event)}
          noValidate
          aria-labelledby="profile-form-heading"
          className="rounded-card border border-border p-5"
        >
          <h2 id="profile-form-heading" className="text-base font-semibold">
            Edit profile preview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Applying these values changes what this page shows for the rest of this
            session. They are not written to storage and are cleared when you reload.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="profile-firstName" label="First name" error={errors.firstName?.message}>
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('firstName')}
                  type="text"
                  autoComplete="given-name"
                  autoCapitalize="words"
                  className="min-h-11"
                />
              )}
            </Field>

            <Field id="profile-lastName" label="Last name" error={errors.lastName?.message}>
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('lastName')}
                  type="text"
                  autoComplete="family-name"
                  autoCapitalize="words"
                  className="min-h-11"
                />
              )}
            </Field>

            <Field
              id="profile-email"
              label="Email address"
              error={errors.email?.message}
              hint="The format is checked here. No message is sent and the address is not verified."
              className="sm:col-span-2"
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('email')}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="min-h-11"
                />
              )}
            </Field>

            <Field
              id="profile-phone"
              label="Phone number"
              error={errors.phone?.message}
              hint="A 10-digit Indian mobile number. Nothing is sent to it."
              className="sm:col-span-2"
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('phone')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="min-h-11"
                />
              )}
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" size="lg">
              Apply to preview
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={closeEditor}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <section
          aria-labelledby="profile-details-heading"
          className="rounded-card border border-border p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2
              id="profile-details-heading"
              className="flex items-center gap-2 text-base font-semibold"
            >
              <UserRound
                className="size-4 shrink-0 text-brand-600"
                aria-hidden="true"
                focusable="false"
              />
              Session profile
            </h2>

            <Button
              ref={editButtonRef}
              type="button"
              variant="outline"
              size="lg"
              onClick={openEditor}
            >
              <Pencil className="size-4" aria-hidden="true" focusable="false" />
              {profile ? 'Edit preview' : 'Add preview details'}
            </Button>
          </div>

          {profile ? (
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </dt>
                <dd className="mt-1 text-sm text-ink-900">
                  {profile.firstName} {profile.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1 break-words text-sm text-ink-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-ink-900">{formatPhone(profile.phone)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground text-pretty">
              No profile details in this session. Add them to see how the page reads
              with values in place — they will be cleared when you reload.
            </p>
          )}

          {profile && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleClear}
              className="mt-5"
            >
              Clear preview details
            </Button>
          )}
        </section>
      )}

      <p className="mt-6 text-sm text-muted-foreground text-pretty">
        These values are kept in memory only. They are not written to storage or
        cookies, never appear in the address bar, are not sent anywhere, and are not
        copied into checkout — the demo checkout asks for its own delivery details.
      </p>
    </CustomerLayout>
  )
}
