import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiEnvelope, ApiErrorPayload, ApiRequestDescriptor } from '@/types';
import { env } from '@/utils/env';

/**
 * ---------------------------------------------------------------------------
 * HTTP layer
 * ---------------------------------------------------------------------------
 * Single axios instance + a thin `apiRequest` wrapper used by every service.
 *
 * While `VITE_USE_MOCK_API=true` the wrapper resolves the descriptor's `mock`
 * function; otherwise it performs the real HTTP call. Backend engineers can
 * therefore integrate endpoint by endpoint without touching UI code.
 */

/** Normalised error surfaced to hooks and UI error states. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status = 0,
    code = 'unknown_error',
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

/* Attach auth credentials. Swap for your real token provider during integration. */
apiClient.interceptors.request.use((config) => {
  if (env.apiToken) {
    config.headers.Authorization = `Bearer ${env.apiToken}`;
  }
  return config;
});

/* Convert every transport failure into a predictable `ApiError`. */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject(
        new ApiError(
          data?.message ?? `Request failed with status ${status}`,
          status,
          data?.code ?? 'http_error',
          data?.details,
        ),
      );
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new ApiError('The request timed out. Please retry.', 0, 'timeout'));
    }

    return Promise.reject(
      new ApiError('Unable to reach the server. Check your connection.', 0, 'network_error'),
    );
  },
);

/** Unwrap `{ data: T }` envelopes while tolerating bare payloads. */
function unwrapResponse<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute a service call.
 *
 * @example
 * apiRequest<DashboardSummary>({
 *   method: 'GET',
 *   url: '/dashboard/summary',
 *   mock: () => buildDashboardSummary('24h'),
 * });
 */
export async function apiRequest<T>(descriptor: ApiRequestDescriptor<T>): Promise<T> {
  const { mock, mockLatencyMs, ...config } = descriptor;

  if (env.useMockApi) {
    await delay(mockLatencyMs ?? env.mockLatencyMs);
    return mock();
  }

  const response = await apiClient.request<ApiEnvelope<T> | T>(config as AxiosRequestConfig);
  return unwrapResponse<T>(response.data);
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/** Convert any thrown value into an `ApiError` for consistent UI handling. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError('An unexpected error occurred.');
}
