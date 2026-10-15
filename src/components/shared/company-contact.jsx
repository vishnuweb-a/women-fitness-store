import {
  COMPANY_EMAIL_HREF,
  COMPANY_INFO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_HREF,
  SITE_DISPLAY,
} from '@/lib/company-info'
import { cn } from '@/lib/utils'

const linkClass =
  'inline-flex min-h-11 items-center font-medium text-brand-600 underline-offset-2 hover:underline'

/**
 * The company's official contact details, for light page surfaces.
 *
 * Used at the foot of every support and policy page (via `SupportLayout`) and
 * at the top of the contact page. The footer renders the same details from
 * the same source in its own dark styling.
 *
 * `address` rather than a plain `div`: these are the contact details for the
 * page's owner, which is exactly what the element means. The labelled `dl`
 * gives each value a visible name, and the phone and email link names start
 * from their visible text so voice control can target them.
 */
export function CompanyContact({ className }) {
  return (
    <address
      className={cn(
        'rounded-card border border-border bg-muted/40 p-4 text-sm not-italic text-ink-800',
        className,
      )}
    >
      <p className="font-display text-base font-bold tracking-tight text-ink-950">
        {COMPANY_INFO.legalName}
      </p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Registered address
          </dt>
          <dd className="mt-1 break-words text-pretty">{COMPANY_INFO.address}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Phone
          </dt>
          <dd>
            <a
              href={COMPANY_PHONE_HREF}
              aria-label={`${COMPANY_PHONE_DISPLAY}, call ${COMPANY_INFO.legalName}`}
              className={linkClass}
            >
              {COMPANY_PHONE_DISPLAY}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email
          </dt>
          <dd>
            <a
              href={COMPANY_EMAIL_HREF}
              aria-label={`${COMPANY_INFO.email}, email ${COMPANY_INFO.legalName}`}
              className={cn(linkClass, 'break-all')}
            >
              {COMPANY_INFO.email}
            </a>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Website
          </dt>
          <dd>
            <a href={COMPANY_INFO.website} className={linkClass}>
              {SITE_DISPLAY}
            </a>
          </dd>
        </div>
      </dl>
    </address>
  )
}
