/**
 * Browser file-download helper used by export flows (e.g. `GET /history/export`).
 * Kept framework-free so services stay transport-agnostic.
 */

/** Trigger a client-side download of an in-memory blob. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
