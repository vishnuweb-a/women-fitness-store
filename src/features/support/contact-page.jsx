/**
 * Contact.
 *
 * ## There is no endpoint, and the page says so before you type
 *
 * No form handler, mail service, ticketing system, or inbox is configured in
 * this build. So the form:
 *
 *   - states that it cannot send a message, **above** the fields rather than
 *     after a submission;
 *   - never reports success, because nothing is ever sent;
 *   - keeps what you type in component state only, and discards it — nothing
 *     is written to storage, a cookie, the address bar, or a network request.
 *
 * It is kept rather than removed because the validation and layout are what a
 * connected form would use, and a disabled-looking form that silently does
 * nothing would be worse than one that explains itself.
 *
 * ## Contact details
 *
 * No email address, phone number, or postal address is shown, because none is
 * configured. Publishing a plausible-looking one would send people to an
 * address that does not answer.
 */
import { useId, useState } from 'react'
import { MailX } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PolicyStatus, SupportLayout, SupportSection } from '@/features/support/support-layout'

export function ContactPage() {
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()
  const statusId = useId()

  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    if (notice) setNotice(null)
  }

  /**
   * Validate, then state plainly that nothing was sent.
   *
   * The validation runs so the form behaves as a real one would, but the
   * outcome is never "message sent" — it cannot be, and a success message
   * here would be the most harmful sentence on the site: someone would stop
   * looking for another way to reach us.
   */
  function handleSubmit(event) {
    event.preventDefault()

    const next = {}
    if (!values.name.trim()) next.name = 'Enter your name.'
    if (!values.email.trim()) next.email = 'Enter an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'Enter a valid email address, like you@example.com.'
    }
    if (!values.message.trim()) next.message = 'Enter a message.'

    setErrors(next)

    if (Object.keys(next).length > 0) {
      const first = ['name', 'email', 'message'].find((field) => next[field])
      document.getElementById({ name: nameId, email: emailId, message: messageId }[first])?.focus()
      return
    }

    setNotice(
      'Your message was not sent. This form has no destination configured, so nothing left your browser and nothing was stored. Please use another way to reach FITNEX until contact is connected.',
    )
  }

  const describedBy = (field, errorId) => (errors[field] ? errorId : undefined)

  return (
    <SupportLayout
      title="Contact"
      description="How to reach FITNEX WOMEN — and, honestly, what is not available yet."
      status={
        <PolicyStatus tone="pending">
          No contact channel is configured for this storefront. There is no published
          email address, phone number, or postal address, and the form below cannot
          send a message.
        </PolicyStatus>
      }
    >
      <SupportSection id="contact-channels" title="Contact details">
        <p>
          None are published here. An email address, phone number, or postal address
          would normally appear in this section, but none has been configured for
          this build — and showing a plausible-looking one would direct you somewhere
          that does not answer.
        </p>
        <p>
          When a merchant contact channel is set up, it will appear here and the form
          below will begin to work.
        </p>
      </SupportSection>

      <SupportSection id="contact-form" title="Message form">
        <p className="flex items-start gap-2 rounded-card border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-ink-900">
          <MailX className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" focusable="false" />
          <span className="text-pretty">
            <strong className="font-semibold">This form cannot send a message.</strong>{' '}
            No submission endpoint exists, so anything you type stays in this page and
            is discarded. It is shown so the layout and validation can be reviewed.
          </span>
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={nameId}>
              Your name
              <span aria-hidden="true" className="text-brand-600">
                *
              </span>
            </Label>
            <Input
              id={nameId}
              type="text"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={(event) => update('name', event.target.value)}
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy('name', `${nameId}-error`)}
              className="min-h-11"
            />
            {errors.name && (
              <p id={`${nameId}-error`} role="alert" className="text-xs font-medium text-brand-600">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={emailId}>
              Email address
              <span aria-hidden="true" className="text-brand-600">
                *
              </span>
            </Label>
            <Input
              id={emailId}
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => update('email', event.target.value)}
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy('email', `${emailId}-error`)}
              className="min-h-11"
            />
            {errors.email && (
              <p
                id={`${emailId}-error`}
                role="alert"
                className="text-xs font-medium text-brand-600"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={messageId}>
              Message
              <span aria-hidden="true" className="text-brand-600">
                *
              </span>
            </Label>
            <textarea
              id={messageId}
              name="message"
              rows={5}
              value={values.message}
              onChange={(event) => update('message', event.target.value)}
              aria-required="true"
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={describedBy('message', `${messageId}-error`)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm"
            />
            {errors.message && (
              <p
                id={`${messageId}-error`}
                role="alert"
                className="text-xs font-medium text-brand-600"
              >
                {errors.message}
              </p>
            )}
          </div>

          <div>
            <Button type="submit" size="lg">
              Check this form
            </Button>
            <p className="mt-2 text-xs text-muted-foreground text-pretty">
              The button validates the fields. It does not send anything, because there
              is nowhere to send it.
            </p>
          </div>

          {/*
            Always present so the outcome is announced once. `role="status"`,
            not `alert`: this is the expected result of pressing the button,
            not an error.
          */}
          <p id={statusId} role="status" aria-live="polite" className="min-h-6 text-sm">
            {notice && (
              <span className="flex items-start gap-2 rounded-card border border-border bg-muted/60 px-4 py-3 text-muted-foreground">
                <MailX className="mt-0.5 size-4 shrink-0" aria-hidden="true" focusable="false" />
                <span className="text-pretty">{notice}</span>
              </span>
            )}
          </p>
        </form>
      </SupportSection>

      <SupportSection id="contact-privacy" title="What happens to what you type">
        <p>
          The values stay in this page's memory while it is open. They are not written
          to storage or cookies, never appear in the address bar, and are discarded
          when you navigate away or reload. Pressing the button makes no network
          request, so nothing you typed is transmitted.
        </p>
        <p>
          Loading this page does involve the network — it is served to you, and the
          site's fonts and images come from third parties. The{' '}
          <Link to="/privacy" className="font-medium text-brand-600 hover:underline">
            privacy page
          </Link>{' '}
          lists which, rather than claiming that no data leaves your browser at all.
        </p>
      </SupportSection>
    </SupportLayout>
  )
}
