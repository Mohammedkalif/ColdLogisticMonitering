import { useEffect } from 'react';
import { APP_NAME } from '@/utils/constants';

/** Keep the browser tab in sync with the active page. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
