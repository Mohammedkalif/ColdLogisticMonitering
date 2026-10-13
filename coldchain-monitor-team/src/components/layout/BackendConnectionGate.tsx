import { useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '@/services/apiClient';
import { env } from '@/utils/env';

type ConnectionState = 'checking' | 'offline' | 'online';

export function BackendConnectionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionState>('checking');

  useEffect(() => {
    if (env.useMockApi) {
      setState('online');
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      let connected = false;
      try {
        await apiClient.get('/health', { timeout: 2500 });
        connected = true;
        if (active) setState('online');
      } catch {
        if (active) setState('offline');
      } finally {
        if (active) timer = setTimeout(check, connected ? 5000 : 3000);
      }
    };

    void check();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  if (state === 'online') return children;

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-6 text-content-primary">
      <section className="w-full max-w-lg rounded-2xl border border-line bg-surface p-8 shadow-xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger">
          <span aria-hidden="true" className="text-2xl">!</span>
        </div>
        <h1 className="text-xl font-semibold">Backend isn’t running</h1>
        <p className="mt-2 text-sm leading-6 text-content-secondary">
          ColdGuard needs its JSON simulation server to load shipments, sensor data, alerts, and predictions.
        </p>
        <div className="mt-5 rounded-lg bg-surface-muted px-4 py-3 font-mono text-sm text-content-primary">
          cd backend &amp;&amp; npm run dev
        </div>
        <p className="mt-4 text-sm text-content-muted">
          {state === 'checking' ? 'Connecting to the backend…' : 'Retrying automatically every 3 seconds.'}
        </p>
      </section>
    </main>
  );
}
