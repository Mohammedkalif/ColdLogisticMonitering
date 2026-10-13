import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, CircleCheckBig, X } from 'lucide-react';
import type { Alert } from '@/types';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { formatDateTime, formatTimeSpan } from '@/utils/date';
import { alertCategoryMeta, alertSeverityMeta, alertStatusMeta } from '@/utils/domain';
import { Badge, Button, IconButton } from '@/components/ui';

export interface AlertDetailDrawerProps {
  alert: Alert | null;
  /** Id of an alert action currently in flight — disables duplicate requests. */
  pendingId: string | null;
  onClose: () => void;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-2xs font-semibold uppercase tracking-wide text-content-muted">{label}</dt>
      <dd className="tabular mt-1 text-sm text-content-primary">{children}</dd>
    </div>
  );
}

/**
 * Alert detail drawer — the operational context view for one alert.
 *
 * Presentation only: every value arrives pre-shaped from the alerts service
 * (`Alert` type). Actions route through the same `useAlertActions` hook the
 * table uses, so pending states and backend calls stay consistent.
 */
export function AlertDetailDrawer({
  alert,
  pendingId,
  onClose,
  onAcknowledge,
  onResolve,
}: AlertDetailDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useOnClickOutside(panelRef, onClose, Boolean(alert));

  const alertId = alert?.id;

  /* Move focus into the drawer each time a NEW alert opens. Keyed on the id
     so a post-action refetch (new object, same alert) does not steal focus
     back from the button the operator just used. */
  useEffect(() => {
    if (alertId) closeRef.current?.focus();
  }, [alertId]);

  /* Minimal focus trap — `aria-modal` requires focus to stay inside. */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!alert) return null;

  const severity = alertSeverityMeta[alert.severity];
  const status = alertStatusMeta[alert.status];
  const category = alertCategoryMeta[alert.category];
  const actionsDisabled = pendingId !== null;

  const durationLabel =
    alert.status === 'open'
      ? `${formatTimeSpan(alert.triggeredAt)} elapsed`
      : alert.status === 'acknowledged' && alert.acknowledgedAt
        ? `Acknowledged after ${formatTimeSpan(alert.triggeredAt, alert.acknowledgedAt)}`
        : alert.resolvedAt
          ? `Resolved after ${formatTimeSpan(alert.triggeredAt, alert.resolvedAt)}`
          : 'Resolved';

  return (
    <>
      <div className="fixed inset-0 z-overlay animate-fade-in bg-black/40" aria-hidden />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-detail-title"
        onKeyDown={handleKeyDown}
        initial={reduceMotion ? false : { x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className="fixed inset-y-0 right-0 z-popover flex w-full max-w-md flex-col border-l border-line bg-surface shadow-popover"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge tone={severity.tone} withDot>
                {severity.label}
              </Badge>
              <span className="font-mono text-2xs text-content-muted">{alert.code}</span>
            </div>
            <h2
              id="alert-detail-title"
              className="mt-2 truncate text-sm font-semibold text-content-primary"
            >
              {alert.title}
            </h2>
          </div>
          <IconButton ref={closeRef} icon={X} label="Close alert details" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            <Badge tone="neutral">{category.label}</Badge>
          </div>

          <section aria-label="What happened">
            <h3 className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
              What happened
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-content-secondary">
              {alert.description}
            </p>
          </section>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-4">
            <DetailItem label="Shipment">
              <span className="font-mono text-xs">{alert.shipmentCode}</span>
            </DetailItem>
            <DetailItem label="Device">
              {alert.deviceId ? (
                <span className="font-mono text-xs">{alert.deviceId}</span>
              ) : (
                <span className="text-content-muted">—</span>
              )}
            </DetailItem>
            <DetailItem label="Triggered">{formatDateTime(alert.triggeredAt)}</DetailItem>
            <DetailItem label="Duration">{durationLabel}</DetailItem>
            {alert.observedValue !== undefined && (
              <>
                <DetailItem label="Observed value">
                  {alert.observedValue}
                  {alert.unit ? ` ${alert.unit}` : ''}
                </DetailItem>
                <DetailItem label="Safe threshold">
                  {alert.thresholdValue !== undefined ? (
                    <>
                      {alert.thresholdValue}
                      {alert.unit ? ` ${alert.unit}` : ''}
                    </>
                  ) : (
                    <span className="text-content-muted">—</span>
                  )}
                </DetailItem>
              </>
            )}
            {alert.acknowledgedAt && (
              <DetailItem label="Acknowledged">
                {formatDateTime(alert.acknowledgedAt)}
                {alert.acknowledgedBy ? ` · ${alert.acknowledgedBy}` : ''}
              </DetailItem>
            )}
          </dl>

          {alert.recommendedAction && (
            <section
              aria-label="Recommended action"
              className="rounded-control border border-line bg-surface-muted p-3.5"
            >
              <h3 className="text-2xs font-semibold uppercase tracking-wide text-content-muted">
                Recommended action
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-content-primary">
                {alert.recommendedAction}
              </p>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          {alert.status === 'open' && (
            <Button
              variant="primary"
              icon={Check}
              isLoading={pendingId === alert.id}
              disabled={actionsDisabled}
              onClick={() => onAcknowledge(alert.id)}
            >
              Acknowledge
            </Button>
          )}
          {alert.status === 'acknowledged' && (
            <Button
              variant="primary"
              icon={CircleCheckBig}
              isLoading={pendingId === alert.id}
              disabled={actionsDisabled}
              onClick={() => onResolve(alert.id)}
            >
              Resolve
            </Button>
          )}
          {alert.status === 'resolved' && (
            <span className="text-xs text-content-muted">No further action required</span>
          )}
        </div>
      </motion.div>
    </>
  );
}
