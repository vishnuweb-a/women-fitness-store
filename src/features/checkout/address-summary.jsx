import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'

import { formatPhone } from '@/features/checkout/checkout-schema'
import { cn } from '@/lib/utils'

/**
 * A read-back block for an address, with an optional edit route.
 *
 * Rendered as an `address` element so the content is exposed with the right
 * semantics, and as discrete lines rather than a comma-joined sentence so a
 * screen reader pauses where a reader's eye does.
 */
export function AddressSummary({
  heading,
  headingId,
  address,
  contact,
  editTo,
  editLabel,
  className,
  // The caller owns the level, because the right one depends on what the
  // block sits under. Hardcoding `h3` skipped from `h1` to `h3` on the
  // payment step, where this block is a direct child of the page.
  as: Heading = 'h2',
}) {
  if (!address) return null

  const lines = [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postalCode,
    address.country,
  ].filter(Boolean)

  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-card border border-border p-4', className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Heading id={headingId} className="text-sm font-semibold uppercase tracking-wide">
          {heading}
        </Heading>
        {editTo && (
          <Link
            to={editTo}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-700 transition-colors hover:text-brand-600"
          >
            <Pencil className="size-3.5" aria-hidden="true" focusable="false" />
            Edit
            <span className="sr-only"> {editLabel ?? heading.toLowerCase()}</span>
          </Link>
        )}
      </div>

      <address className="mt-2 text-sm not-italic leading-relaxed text-ink-800">
        {/* The list is a fixed, re-derived sequence of address lines, never
            reordered, so the index is a stable key even when two lines of an
            address happen to carry the same text. */}
        {lines.map((line, index) => (
          <span key={index} className="block text-pretty">
            {line}
          </span>
        ))}
        {contact && (
          <>
            <span className="mt-2 block break-words">{contact.email}</span>
            <span className="block">{formatPhone(contact.phone)}</span>
          </>
        )}
      </address>
    </section>
  )
}
