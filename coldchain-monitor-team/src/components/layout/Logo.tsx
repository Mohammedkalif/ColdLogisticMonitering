import { cn } from '@/utils/cn';
import { APP_DESCRIPTION, APP_SHORT_NAME } from '@/utils/constants';

export interface LogoProps {
  /** Hide the wordmark (collapsed sidebar / narrow top bar). */
  markOnly?: boolean;
  className?: string;
}

/** Product mark + wordmark. The mark doubles as the favicon artwork. */
export function Logo({ markOnly = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand text-white"
        aria-hidden
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20M12 2 9 5M12 2l3 3M12 22l-3-3M12 22l3-3" />
          <path
            d="m3.5 7 17 10M3.5 7l.3 4.2M3.5 7l4.1-1.1M20.5 17l-.3-4.2M20.5 17l-4.1 1.1"
            opacity="0.85"
          />
          <path
            d="m20.5 7-17 10M20.5 7l-4.1-1.1M20.5 7l-.3 4.2M3.5 17l4.1 1.1M3.5 17l.3-4.2"
            opacity="0.85"
          />
        </svg>
      </span>

      {!markOnly && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold tracking-tight text-content-primary">
            {APP_SHORT_NAME}
          </span>
          <span className="truncate text-2xs text-content-muted" title={APP_DESCRIPTION}>
            Horticulture Cold Chain
          </span>
        </span>
      )}
    </div>
  );
}
