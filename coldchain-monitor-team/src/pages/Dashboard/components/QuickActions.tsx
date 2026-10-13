import { useNavigate } from 'react-router-dom';
import { BellRing, BrainCircuit, RefreshCw, Radio } from 'lucide-react';
import { ROUTE_PATHS } from '@/routes/routes.config';
import { Button } from '@/components/ui';

export interface QuickActionsProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * Primary operator shortcuts.
 *
 * Navigation targets come from the central route registry so paths never
 * drift from the router.
 */
export function QuickActions({ onRefresh, isRefreshing }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" icon={RefreshCw} onClick={onRefresh} isLoading={isRefreshing}>
        Refresh data
      </Button>
      <Button variant="secondary" icon={Radio} onClick={() => navigate(ROUTE_PATHS.liveMonitoring)}>
        Live monitoring
      </Button>
      <Button
        variant="secondary"
        icon={BrainCircuit}
        onClick={() => navigate(ROUTE_PATHS.prediction)}
      >
        Generate prediction
      </Button>
      <Button variant="secondary" icon={BellRing} onClick={() => navigate(ROUTE_PATHS.alerts)}>
        View alerts
      </Button>
    </div>
  );
}
