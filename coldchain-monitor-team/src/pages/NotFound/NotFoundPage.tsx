import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/routes/routes.config';
import { Button, Card, EmptyState } from '@/components/ui';

/** Fallback route for unknown URLs. */
export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="The screen you're looking for doesn't exist or has been moved."
          action={
            <Link to={ROUTE_PATHS.dashboard}>
              <Button variant="primary">Back to dashboard</Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}
