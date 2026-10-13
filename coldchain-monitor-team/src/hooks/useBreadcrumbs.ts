import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { findRouteByPath, ROUTE_PATHS } from '@/routes/routes.config';
import { humanizeToken } from '@/utils/format';

export interface Breadcrumb {
  label: string;
  /** Omitted for the current (last) crumb. */
  path?: string;
}

/**
 * Derive breadcrumbs from the URL and the central route registry.
 * Unknown trailing segments (ids, tabs) are humanised automatically.
 */
export function useBreadcrumbs(): Breadcrumb[] {
  const { pathname } = useLocation();

  return useMemo(() => {
    const crumbs: Breadcrumb[] = [{ label: 'Home', path: ROUTE_PATHS.dashboard }];
    if (pathname === ROUTE_PATHS.dashboard) return [{ label: 'Dashboard' }];

    const route = findRouteByPath(pathname);
    if (!route) {
      return [...crumbs, { label: 'Not found' }];
    }

    crumbs.push({ label: route.label, path: route.path });

    const remainder = pathname.slice(route.path.length).split('/').filter(Boolean);
    remainder.forEach((segment, index) => {
      const isLast = index === remainder.length - 1;
      const label = /^[a-f0-9-]{6,}$/i.test(segment)
        ? segment.toUpperCase()
        : humanizeToken(segment);
      crumbs.push(isLast ? { label } : { label, path: `${route.path}/${segment}` });
    });

    /* The last crumb represents the current page and is never a link. */
    const last = crumbs[crumbs.length - 1];
    if (last) delete last.path;

    return crumbs;
  }, [pathname]);
}
