import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { cn } from '@/utils/cn';

export interface BreadcrumbsProps {
  className?: string;
}

/** Location trail derived from the route registry. */
export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const crumbs = useBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <li className="min-w-0">
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    className="truncate text-content-muted transition hover:text-content-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-content-primary" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden className="text-content-muted/60">
                  <ChevronRight size={14} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
