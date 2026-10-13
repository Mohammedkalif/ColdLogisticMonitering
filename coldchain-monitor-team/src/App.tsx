import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/contexts';
import { ErrorBoundary } from '@/components/layout';
import { AppRoutes } from '@/routes';
import { BackendConnectionGate } from '@/components/layout/BackendConnectionGate';

/**
 * Application root.
 *
 * Order matters: the router must wrap the providers because `SidebarProvider`
 * reacts to navigation, and the error boundary sits outside everything.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <BackendConnectionGate>
            <AppRoutes />
          </BackendConnectionGate>
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
