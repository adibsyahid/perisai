import { verifyRequest } from "@/lib/firebase-admin";
import { createPairCode, getProfile } from "@/lib/family-server";

// The protected person (e.g. Mak) asks for a 6-digit code to give to a guardian.
export async function POST(request: Request) {
  const uid = await verifyRequest(request);
  if (!uid) return Response.json({ error: "auth" }, { status: 401 });

  const profile = await getProfile(uid);
  if (!profile) return Response.json({ error: "no_profile" }, { status: 400 });

  return Response.json(await createPairCode(uid, profile.name));
}
