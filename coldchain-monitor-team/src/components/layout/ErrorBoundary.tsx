import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors so a single failing module never blanks the whole
 * application. Wire `componentDidCatch` to Sentry/Datadog during integration.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-app p-6">
        <Card className="w-full max-w-lg p-6">
          <h1 className="text-base font-semibold text-content-primary">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-content-muted">
            An unexpected error interrupted this screen. Reloading usually resolves it — if the
            problem persists, share the details below with the platform team.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-control border border-line bg-surface-muted p-3 font-mono text-2xs text-content-secondary">
            {error.message}
          </pre>
          <div className="mt-5 flex justify-end">
            <Button variant="primary" icon={RefreshCw} onClick={() => window.location.reload()}>
              Reload application
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}
