import { useCallback, useState } from 'react';
import type { AppSettings } from '@/types';
import { settingsApi, toApiError, type ApiError } from '@/services';
import { useAsyncData } from './useAsyncData';

/** Workspace configuration for the Settings page. */
export function useSettings() {
  const fetcher = useCallback(() => settingsApi.getSettings(), []);
  return useAsyncData(fetcher);
}

/** Signed-in operator shown in the top bar profile menu. */
export function useCurrentUser() {
  const fetcher = useCallback(() => settingsApi.getCurrentUser(), []);
  return useAsyncData(fetcher);
}

/** Persist a settings patch with saving/saved state for the form footer. */
export function useSaveSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const save = useCallback(async (patch: Partial<AppSettings>) => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await settingsApi.updateSettings(patch);
      setSavedAt(new Date());
      return result;
    } catch (caught) {
      setError(toApiError(caught));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { save, isSaving, savedAt, error };
}
