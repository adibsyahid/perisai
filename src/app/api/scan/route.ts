import { after } from "next/server";
import { verifyRequest } from "@/lib/firebase-admin";
import { notifyGuardians } from "@/lib/family-server";
import { addReport } from "@/lib/radar-server";
import { askGemini } from "@/lib/gemini";
import { checkLinks } from "@/lib/heuristics";
import { bm } from "@/lib/i18n/bm";
import { en } from "@/lib/i18n/en";
import type { ScanErrorCode, ScanRequest, ScanResult, Verdict } from "@/lib/scan-types";

// Gemini gets up to 20 s (BLUEPRINT); leave headroom for the rest of the request.
export const maxDuration = 30;

const MAX_TEXT = 4000;
const MAX_IMAGE_BASE64 = 3_000_000; // ~2.2 MB JPEG; the phone resizes to <=1600px first
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// 20 scans per 10 minutes per user (BLUEPRINT F1). Kept in memory: simple, and good
// enough for a prototype. Each server instance counts on its own.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SCANS = 20;
const recentScans = new Map<string, number[]>();

function isRateLimited(uid: string) {
  const now = Date.now();
  const times = (recentScans.get(uid) ?? []).filter((t) => now - t < WINDOW_MS);
  times.push(now);
  recentScans.set(uid, times);
  return times.length > MAX_SCANS;
}

function fail(code: ScanErrorCode, status: number) {
  return Response.json({ error: code }, { status });
}

function verdictFor(score: number): Verdict {
  if (score >= 70) return "SCAM";
  if (score >= 40) return "MENCURIGAKAN";
  return "SELAMAT";
}

function parseRequest(body: unknown): ScanRequest | null {
  if (!body || typeof body !== "object") return null;
  const { kind, lang, text, image, radar } = body as Partial<ScanRequest>;
  if (!["text", "link", "number", "image"].includes(kind ?? "")) return null;
  const cleanText = typeof text === "string" ? text.slice(0, MAX_TEXT) : "";
  const cleanImage =
    image && typeof image.data === "string" && IMAGE_TYPES.includes(image.mimeType) && image.data.length <= MAX_IMAGE_BASE64
      ? image
      : undefined;
  if (!cleanText.trim() && !cleanImage) return null;
  return { kind: kind!, lang: lang === "en" ? "en" : "ms", text: cleanText, image: cleanImage, radar: radar !== false };
}

export async function POST(request: Request) {
  const uid = await verifyRequest(request);
  if (!uid) return fail("auth", 401);
  if (isRateLimited(uid)) return fail("rate_limited", 429);

  const scan = parseRequest(await request.json().catch(() => null));
  if (!scan) return fail("bad_input", 400);

  const links = checkLinks(scan.text ?? "");

  let ai: ScanResult;
  try {
    ai = (await askGemini(scan)).result;
  } catch (error) {
    // Log only what went wrong, never the user's content.
    console.error("scan: gemini failed", (error as Error).cause ?? (error as Error).name);
    return fail("busy", 503);
  }

  // Combine (BLUEPRINT F1): the higher score wins, and the rule-based flags are added.
  const t = scan.lang === "en" ? en : bm;
  const riskScore = Math.min(100, Math.max(ai.riskScore, links.score));
  const unsure = ai.verdict === "TIDAK_PASTI" && links.score < 40;

  const result: ScanResult = {
    ...ai,
    riskScore,
    verdict: unsure ? "TIDAK_PASTI" : verdictFor(riskScore),
    redFlags: [
      ...ai.redFlags,
      ...links.flags
        .filter((flag) => !ai.redFlags.some((f) => f.quote.includes(flag.quote) || flag.quote.includes(f.quote)))
        .map((flag) => ({ quote: flag.quote, reason: t.scan.flags[flag.code] })),
    ].slice(0, 6),
    extracted: { ...ai.extracted, urls: [...new Set([...ai.extracted.urls, ...links.urls])] },
  };

  // after() runs once the answer is sent, so the person waiting for the verdict
  // is never slowed down by the family alert or the Radar report.
  if (result.verdict === "SCAM") {
    // Alert the family (BLUEPRINT F3).
    after(async () => {
      try {
        await notifyGuardians(uid, result);
      } catch (error) {
        console.error("scan: guardian alert failed", (error as Error).name);
      }
    });
  }
  if ((result.verdict === "SCAM" || result.verdict === "MENCURIGAKAN") && scan.radar) {
    // Anonymous dot on Radar Scam (BLUEPRINT F4): type, verdict, state and time only.
    after(async () => {
      try {
        await addReport(uid, result.verdict, result.scamType);
      } catch (error) {
        console.error("scan: radar report failed", (error as Error).name);
      }
    });
  }

  return Response.json(result);
}
