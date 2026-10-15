import { verifyRequest } from "@/lib/firebase-admin";
import { markAlertHandled } from "@/lib/family-server";

// A guardian taps "Tandakan sudah dihubungi" on an alert.
export async function POST(request: Request) {
  const uid = await verifyRequest(request);
  if (!uid) return Response.json({ error: "auth" }, { status: 401 });

  const { alertId } = ((await request.json().catch(() => ({}))) ?? {}) as { alertId?: unknown };
  if (typeof alertId !== "string" || !alertId) return Response.json({ error: "bad_input" }, { status: 400 });

  const ok = await markAlertHandled(alertId, uid);
  return ok ? Response.json({ ok: true }) : Response.json({ error: "forbidden" }, { status: 403 });
}
