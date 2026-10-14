// Phone side of a scan: tidy and redact the input, shrink images, call /api/scan.
import { getIdToken } from "./firebase-client";
import { normalise, redact } from "./redact";
import type { ScanErrorCode, ScanKind, ScanRequest, ScanResult } from "./scan-types";

export type ScanInput =
  | { kind: Exclude<ScanKind, "image">; text: string }
  | { kind: "image"; file: File };

export type ClientErrorCode = ScanErrorCode | "offline" | "image";

export class ScanError extends Error {
  constructor(public code: ClientErrorCode) {
    super(code);
  }
}

const MAX_IMAGE_SIDE = 1600;

// Resize on the phone so uploads stay small and fast on 4G (BLUEPRINT F1).
async function shrinkImage(file: File): Promise<{ data: string; mimeType: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    return { data: dataUrl.split(",")[1], mimeType: "image/jpeg" };
  } catch {
    throw new ScanError("image");
  }
}

export async function runScan(input: ScanInput, lang: "ms" | "en"): Promise<ScanResult> {
  if (!navigator.onLine) throw new ScanError("offline");

  const body: ScanRequest =
    input.kind === "image"
      ? { kind: "image", lang, image: await shrinkImage(input.file) }
      : { kind: input.kind, lang, text: redact(normalise(input.text)) };

  let response: Response;
  try {
    const token = await getIdToken();
    response = await fetch("/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ScanError(navigator.onLine ? "server" : "offline");
  }

  if (!response.ok) {
    const { error } = (await response.json().catch(() => ({}))) as { error?: ScanErrorCode };
    throw new ScanError(error ?? "server");
  }
  return (await response.json()) as ScanResult;
}

// A short, safe preview for the history list: redacted and cut, never the full message.
export function previewOf(input: ScanInput): string {
  if (input.kind === "image") return "";
  return redact(normalise(input.text)).replace(/\s+/g, " ").slice(0, 80);
}
