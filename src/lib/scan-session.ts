// Hands the user's choice from the Utama screen to the /imbas screen:
// either a new input to scan, or a saved result from history.
// A plain module variable: it survives client-side navigation but not a reload,
// which is what we want (the message is never written to storage).
import type { ScanInput } from "./scan-client";

export type PendingScan = { type: "new"; input: ScanInput } | { type: "history"; id: string };

let pending: PendingScan | null = null;

export function setPendingScan(next: PendingScan) {
  pending = next;
}

// Look without taking (safe to call while rendering).
export function peekPendingScan(): PendingScan | null {
  return pending;
}

// Returns the pending scan once, then forgets it.
export function takePendingScan(): PendingScan | null {
  const current = pending;
  pending = null;
  return current;
}
