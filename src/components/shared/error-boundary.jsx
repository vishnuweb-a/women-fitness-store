import { Component } from 'react'

import { Button } from '@/components/ui/button'

/**
 * Top-level error boundary.
 *
 * React has no hook equivalent for `componentDidCatch`, so this stays a class
 * component — the one exception to the functional-component rule.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    // Replace with a real reporting service when one is introduced.
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const { children } = this.props

    if (!error) return children

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <h1 className="font-display text-display-sm font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-prose text-muted-foreground">
          An unexpected error stopped this page from loading. Try again, and if
          it keeps happening please contact support.
        </p>
        {import.meta.env.DEV && (
          <pre className="max-w-full overflow-x-auto rounded-md bg-muted p-4 text-left text-sm">
            {error.message}
          </pre>
        )}
        <Button onClick={this.handleReset}>Try again</Button>
      </div>
    )
  }
}
