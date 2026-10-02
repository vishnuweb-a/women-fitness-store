/**
 * Address preview.
 *
 * Add, edit, delete, and choose a default — all in memory for one session.
 *
 * The address fields and their validation are **reused** from the checkout
 * schema rather than restated, so there is one PIN-code rule and one state
 * list in the project. Only the label is new.
 *
 * ## What these are not
 *
 * Not saved account addresses. There is no account and no storage, so the
 * page says "address preview" everywhere rather than "saved addresses", and
 * nothing here is copied into checkout automatically — the demo checkout
 * collects its own delivery address, and a preview silently becoming the
 * address a checkout ran against is exactly the surprise to avoid.
 *
 * ## The one-default invariant
 *
 * Whenever any address exists, exactly one is marked default — including
 * after the default itself is deleted, where the first remaining entry is
 * promoted. That rule lives in `customer-state.js` and is covered by tests,
 * because it is the piece most likely to break quietly.
 */
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AddressFields, Field } from '@/features/checkout/address-fields'
import { CustomerLayout } from '@/features/customer/customer-layout'
import {
  addressPreviewSchema,
  emptyAddressPreview,
  resolveAddressLabel,
} from '@/features/customer/customer-schema'
import { ADDRESS_LABEL_PRESETS } from '@/features/customer/customer-state'
import { useCustomer } from '@/features/customer/use-customer'

/** Field order for moving focus to the first invalid control. */
const FIELD_ORDER = [
  'labelKind',
  'customLabel',
  'firstName',
  'lastName',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
]

export function AddressPreviewPage() {
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } =
    useCustomer()

  /** `null` when the form is closed, otherwise `'new'` or an address id. */
  const [editingId, setEditingId] = useState(null)
  /** The address queued for deletion, or null. */
  const [pendingDelete, setPendingDelete] = useState(null)
  const [status, setStatus] = useState(null)

  const addButtonRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressPreviewSchema),
    defaultValues: emptyAddressPreview,
    mode: 'onSubmit',
  })

  // `useWatch`, not `watch()`: the React Compiler lint rule rejects the
  // latter because the returned function cannot be memoized safely. Same
  // choice as the payment step.
  const labelKind = useWatch({ control, name: 'labelKind' })

  function openNew() {
    reset(emptyAddressPreview)
    setStatus(null)
    setEditingId('new')
  }

  function openEdit(entry) {
    const preset = ADDRESS_LABEL_PRESETS.includes(entry.label)
    reset({
      ...entry.address,
      labelKind: preset ? entry.label : 'custom',
      customLabel: preset ? '' : entry.label,
    })
    setStatus(null)
    setEditingId(entry.id)
  }

  /**
   * Close the form and return focus to the Add button.
   *
   * `flushSync` commits the unmount before the focus call, so the button
   * exists to receive it. See the same note on the profile page.
   */
  function closeForm() {
    flushSync(() => setEditingId(null))
    addButtonRef.current?.focus()
  }

  function onSubmit(values) {
    const { labelKind: kind, customLabel, ...address } = values
    const label = resolveAddressLabel({ labelKind: kind, customLabel })

    if (editingId === 'new') {
      addAddress({ label, address })
      setStatus(`Address preview "${label}" added for this session.`)
    } else {
      updateAddress(editingId, { label, address })
      setStatus(`Address preview "${label}" updated.`)
    }
    closeForm()
  }

  function onInvalid(fieldErrors) {
    const first = FIELD_ORDER.find((name) => fieldErrors[name])
    if (first) setFocus(first)
  }

  function confirmDelete() {
    if (!pendingDelete) return
    removeAddress(pendingDelete.id)
    setStatus(
      pendingDelete.isDefault && addresses.length > 1
        ? `Address preview "${pendingDelete.label}" deleted. Another address is now the default.`
        : `Address preview "${pendingDelete.label}" deleted.`,
    )
    setPendingDelete(null)
  }

  const formOpen = editingId !== null

  return (
    <CustomerLayout
      title="Address preview"
      description="Try the address book an account would hold. These previews are not saved and are not used by checkout."
    >
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-medium text-success">
        {status}
      </p>

      {formOpen ? (
        <form
          // Wrapped rather than passed directly: `handleSubmit(...)` is called
          // during render, and `onSubmit` closes over the focus ref.
          onSubmit={(event) => handleSubmit(onSubmit, onInvalid)(event)}
          noValidate
          aria-labelledby="address-form-heading"
          className="rounded-card border border-border p-5"
        >
          <h2 id="address-form-heading" className="text-base font-semibold">
            {editingId === 'new' ? 'Add an address preview' : 'Edit address preview'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            The format of each field is checked. Whether the address exists, and
            whether delivery reaches it, is not — no coverage data exists in this
            build.
          </p>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium">Label</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {[...ADDRESS_LABEL_PRESETS, 'custom'].map((kind) => (
                <label
                  key={kind}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-border px-3 text-sm transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500"
                >
                  <input
                    {...register('labelKind')}
                    type="radio"
                    value={kind}
                    className="size-4 accent-brand-500"
                  />
                  {kind === 'custom' ? 'Custom label' : kind}
                </label>
              ))}
            </div>
            {errors.labelKind && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-brand-600">
                {errors.labelKind.message}
              </p>
            )}
          </fieldset>

          {labelKind === 'custom' && (
            <Field
              id="address-customLabel"
              label="Custom label"
              error={errors.customLabel?.message}
              className="mt-4 sm:max-w-xs"
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  {...register('customLabel')}
                  type="text"
                  maxLength={30}
                  placeholder="Studio, parents', gym…"
                  className="min-h-11"
                />
              )}
            </Field>
          )}

          <div className="mt-5">
            <AddressFields
              register={register}
              errors={errors}
              prefix=""
              idPrefix="address-preview"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" size="lg">
              {editingId === 'new' ? 'Add to preview' : 'Apply to preview'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">
              Session addresses{' '}
              <span className="font-normal tabular-nums text-muted-foreground">
                ({addresses.length})
              </span>
            </h2>
            <Button ref={addButtonRef} type="button" size="lg" onClick={openNew}>
              <Plus className="size-4" aria-hidden="true" focusable="false" />
              Add an address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No address previews in this session"
              description="Add one to see how an address book would read. Previews are held in memory and are cleared when you reload."
              className="mt-4"
              action={
                <Button type="button" size="lg" onClick={openNew} className="mt-2">
                  <Plus className="size-4" aria-hidden="true" focusable="false" />
                  Add an address
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {addresses.map((entry) => (
                <AddressCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => openEdit(entry)}
                  onDelete={() => setPendingDelete(entry)}
                  onMakeDefault={() => {
                    setDefaultAddress(entry.id)
                    setStatus(`"${entry.label}" is now the default preview address.`)
                  }}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <p className="mt-6 text-sm text-muted-foreground text-pretty">
        Address previews are kept in memory only. They are not written to storage or
        cookies, never appear in the address bar, are not sent anywhere, and are not
        copied into checkout — the demo checkout collects its own delivery address.
      </p>

      {/*
        Radix `Dialog` handles the focus trap, Escape, and restoring focus to
        whatever opened it. Deletion is confirmed rather than immediate: it is
        the one destructive action on this page and there is no undo.
      */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this address preview?</DialogTitle>
            <DialogDescription className="text-pretty">
              {pendingDelete
                ? `"${pendingDelete.label}" will be removed from this session. This cannot be undone.`
                : ''}
              {pendingDelete?.isDefault && addresses.length > 1
                ? ' It is the current default, so another address will become the default.'
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Keep it
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" size="lg" onClick={confirmDelete}>
              <Trash2 className="size-4" aria-hidden="true" focusable="false" />
              Delete preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  )
}

/** One address preview card. */
function AddressCard({ entry, onEdit, onDelete, onMakeDefault }) {
  const headingId = `address-${entry.id}`
  const { address } = entry

  const lines = [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
    address.country,
  ].filter(Boolean)

  return (
    <li>
      <section
        aria-labelledby={headingId}
        className="flex h-full flex-col rounded-card border border-border p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={headingId} className="text-sm font-semibold">
            {entry.label}
          </h3>
          {entry.isDefault && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
              <Check className="size-3" aria-hidden="true" focusable="false" />
              Default preview
            </span>
          )}
        </div>

        <address className="mt-2 text-sm not-italic leading-relaxed text-ink-800">
          {/* A fixed, re-derived sequence of lines, never reordered, so the
              index is a stable key even when two lines carry the same text. */}
          {lines.map((line, index) => (
            <span key={index} className="block text-pretty">
              {line}
            </span>
          ))}
        </address>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={onEdit}>
            <Pencil className="size-3.5" aria-hidden="true" focusable="false" />
            Edit
            <span className="sr-only"> {entry.label}</span>
          </Button>

          {!entry.isDefault && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11"
              onClick={onMakeDefault}
            >
              Set as default
              <span className="sr-only"> — {entry.label}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 text-brand-600 hover:bg-brand-50 hover:text-brand-700"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" aria-hidden="true" focusable="false" />
            Delete
            <span className="sr-only"> {entry.label}</span>
          </Button>
        </div>
      </section>
    </li>
  )
}
