import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CHECKOUT_STEPS } from '@/features/checkout/checkout-state'
import { cn } from '@/lib/utils'

/**
 * Checkout progress indicator.
 *
 * An ordered list inside a `nav`, which gives a screen reader the count and
 * position for free. The current step carries `aria-current="step"`; completed
 * steps that can be returned to are real links, and steps not yet reached are
 * plain text rather than disabled links nobody can operate.
 *
 * The connector rule between markers is decorative and hidden from assistive
 * technology — each step already states its own status in visually-hidden
 * text, so nothing depends on seeing the line.
 */
export function CheckoutStepIndicator({ current, className }) {
  const currentIndex = CHECKOUT_STEPS.findIndex((step) => step.id === current)

  return (
    <nav aria-label="Checkout progress" className={className}>
      <ol className="flex items-start">
        {CHECKOUT_STEPS.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const canReturn = isComplete && step.path

          const inner = (
            <>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums',
                  isComplete && 'border-brand-500 bg-brand-500 text-white',
                  isCurrent && 'border-brand-500 bg-background text-brand-600',
                  !isComplete && !isCurrent && 'border-border bg-background text-muted-foreground',
                )}
              >
                {isComplete ? (
                  <Check className="size-4" aria-hidden="true" focusable="false" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  'text-center text-xs font-medium sm:text-sm',
                  isCurrent ? 'text-ink-950' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
              <span className="sr-only">
                : {isComplete ? 'Completed' : isCurrent ? 'Current step' : 'Not yet reached'}
                {canReturn ? '. Go back to this step.' : ''}
              </span>
            </>
          )

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex flex-1 flex-col items-center"
            >
              {/* Decorative rule joining this marker to the previous one. */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute right-1/2 top-4 -z-10 h-0.5 w-full -translate-y-1/2',
                    index <= currentIndex ? 'bg-brand-500' : 'bg-border',
                  )}
                />
              )}

              {canReturn ? (
                <Link
                  to={step.path}
                  className="flex min-h-11 w-full flex-col items-center gap-1.5 rounded-control px-1 py-0.5 transition-colors hover:text-brand-600"
                >
                  {inner}
                </Link>
              ) : (
                <span className="flex min-h-11 w-full flex-col items-center gap-1.5 px-1 py-0.5">
                  {inner}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
