import { Link } from 'react-router-dom'

import { PageShell } from '@/components/shared/page-shell'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <PageShell
      title="Page not found"
      description="The page you were looking for does not exist or has moved."
      noIndex
    >
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </PageShell>
  )
}
