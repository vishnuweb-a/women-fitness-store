import { useId, useState } from 'react'
import { Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Newsletter sign-up.
 *
 * **There is no subscription backend.** No list exists, nothing is stored, and
 * no email is sent. Submitting therefore never claims success — it validates
 * the address and then says plainly that sign-up is not connected yet. Showing
 * "You're subscribed!" here would be a lie to the visitor.
 */
export function NewsletterForm() {
  const inputId = useId()
  const statusId = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()
    const value = email.trim()

    if (!value) {
      setStatus({ type: 'error', message: 'Enter an email address to continue.' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' })
      return
    }

    setStatus({
      type: 'notice',
      message:
        'Newsletter sign-up is not connected yet, so your address was not saved and you have not been subscribed.',
    })
  }

  const isError = status?.type === 'error'

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md">
      <Label htmlFor={inputId} className="text-sm font-medium text-ink-200">
        Email address
      </Label>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (status) setStatus(null)
          }}
          aria-invalid={isError}
          aria-describedby={status ? statusId : undefined}
          className="min-h-11 bg-white text-ink-950 placeholder:text-ink-500"
        />
        <Button type="submit" className="min-h-11 shrink-0">
          Subscribe
        </Button>
      </div>

      {status && (
        <p
          id={statusId}
          role={isError ? 'alert' : 'status'}
          className={
            isError
              ? 'mt-2 flex gap-2 text-sm text-brand-300'
              : 'mt-2 flex gap-2 text-sm text-ink-300'
          }
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" focusable="false" />
          <span className="text-pretty">{status.message}</span>
        </p>
      )}
    </form>
  )
}
