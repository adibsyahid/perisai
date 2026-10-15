import { verifyRequest } from "@/lib/firebase-admin";
import { notifyGuardians } from "@/lib/family-server";
import { SCAM_TYPES, VERDICTS, type ScamType, type Verdict } from "@/lib/scan-types";

// "Maklumkan Penjaga": the protected person chooses to alert their guardians
// about a result (SCAM results are sent automatically by /api/scan).
export async function POST(request: Request) {
  const uid = await verifyRequest(request);
  if (!uid) return Response.json({ error: "auth" }, { status: 401 });

  const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  const verdict = body.verdict as Verdict;
  const scamType = body.scamType as ScamType;
  if (!VERDICTS.includes(verdict) || !SCAM_TYPES.includes(scamType)) {
    return Response.json({ error: "bad_input" }, { status: 400 });
  }

  const notified = await notifyGuardians(uid, {
    verdict,
    scamType,
    headline: typeof body.headline === "string" ? body.headline : "",
    riskScore: typeof body.riskScore === "number" ? Math.max(0, Math.min(100, body.riskScore)) : 0,
  });
  return Response.json({ notified });
}
