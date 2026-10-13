/**
 * Typed access to build-time configuration.
 *
 * Nothing else in the app should read `import.meta.env` directly — this keeps
 * defaults in one place and makes the config easy to audit.
 */
const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined && value !== '' ? parsed : fallback;
};

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  /** Opt in to browser-only fixtures; server-backed simulation is the default. */
  useMockApi: toBoolean(import.meta.env.VITE_USE_MOCK_API, false),
  mockLatencyMs: toNumber(import.meta.env.VITE_MOCK_LATENCY_MS, 450),
  telemetryPollIntervalMs: toNumber(import.meta.env.VITE_TELEMETRY_POLL_INTERVAL_MS, 5000),
  apiToken: import.meta.env.VITE_API_TOKEN ?? '',
  isDevelopment: import.meta.env.DEV,
} as const;
