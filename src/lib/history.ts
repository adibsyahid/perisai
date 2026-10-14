// Scan history lives ONLY on this phone (IndexedDB), never on the server.
// We keep the last 30 results, with a short redacted preview and no images.
import { get, set } from "idb-keyval";
import type { ScanKind, ScanResult } from "./scan-types";

const KEY = "perisai.history";
const LIMIT = 30;

export type HistoryItem = {
  id: string;
  createdAt: number;
  kind: ScanKind;
  preview: string;
  result: ScanResult;
};

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    return (await get<HistoryItem[]>(KEY)) ?? [];
  } catch {
    return []; // Private mode can block IndexedDB; history is a nice-to-have.
  }
}

export async function addToHistory(item: Omit<HistoryItem, "id" | "createdAt">): Promise<HistoryItem> {
  const saved: HistoryItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
  try {
    const items = await loadHistory();
    await set(KEY, [saved, ...items].slice(0, LIMIT));
  } catch {
    // Not saved, but the user still sees the result.
  }
  return saved;
}

export async function findInHistory(id: string): Promise<HistoryItem | undefined> {
  return (await loadHistory()).find((item) => item.id === id);
}
