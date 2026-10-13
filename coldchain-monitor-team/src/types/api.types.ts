import type { AxiosRequestConfig } from 'axios';

/**
 * Contract expected from the backend.
 *
 * Every endpoint is expected to answer with this envelope. If the backend
 * returns bare payloads instead, adjust `unwrapResponse` in
 * `src/services/apiClient.ts` — no UI change is required.
 */
export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

/** Error payload shape returned by the backend for non-2xx responses. */
export interface ApiErrorPayload {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/** Lifecycle of any asynchronous read performed through `useAsyncData`. */
export type RequestStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error';

/**
 * Descriptor consumed by `apiRequest`. `mock` is used while
 * `VITE_USE_MOCK_API=true`; the axios config is used otherwise.
 */
export interface ApiRequestDescriptor<T> extends AxiosRequestConfig {
  /** Local mock resolver — replaced by the real endpoint response later. */
  mock: () => T | Promise<T>;
  /** Override the global mock latency for this call (ms). */
  mockLatencyMs?: number;
}
