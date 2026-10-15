import { verifyRequest } from "@/lib/firebase-admin";
import { getProfile, joinWithCode } from "@/lib/family-server";

// The guardian (e.g. Anak) types the code shown on the protected person's phone.
export async function POST(request: Request) {
  const uid = await verifyRequest(request);
  if (!uid) return Response.json({ error: "auth" }, { status: 401 });

  const { code } = ((await request.json().catch(() => ({}))) ?? {}) as { code?: unknown };
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return Response.json({ error: "not_found" }, { status: 400 });
  }

  const profile = await getProfile(uid);
  if (!profile) return Response.json({ error: "no_profile" }, { status: 400 });

  const result = await joinWithCode(code, uid, profile.name);
  if (!result.ok) return Response.json({ error: result.reason }, { status: 400 });
  return Response.json(result);
}
