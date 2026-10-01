import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import { PageShell } from '@/components/shared/page-shell'
import { Button } from '@/components/ui/button'

/**
 * Rendered when a route throws or a URL does not match.
 *
 * A 404 from the router gets the same wording as the not-found page; anything
 * else is reported as a generic failure.
 */
export function RouteError() {
  const error = useRouteError()

  const isNotFound = isRouteErrorResponse(error) && error.status === 404

  const title = isNotFound ? 'Page not found' : 'Something went wrong'
  const description = isNotFound
    ? 'The page you were looking for does not exist or has moved.'
    : 'This page failed to load. Please try again.'

  return (
    <div role="alert">
      <PageShell title={title} description={description}>
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </PageShell>
    </div>
  )
}
