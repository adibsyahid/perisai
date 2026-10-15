import { verifyRequest } from "@/lib/firebase-admin";
import { clearDemoReports, fillDemoReports } from "@/lib/radar-server";

// "Isi data demo" / "Padam data demo" (used from the hidden eval page).
// Demo reports are always marked isDemo, and Radar shows a "Termasuk data demo" chip.
export async function POST(request: Request) {
  const uid = await verifyRequest(request);
  if (!uid) return Response.json({ error: "auth" }, { status: 401 });

  const { action } = ((await request.json().catch(() => ({}))) ?? {}) as { action?: string };
  if (action === "fill") return Response.json({ added: await fillDemoReports() });
  if (action === "clear") return Response.json({ removed: await clearDemoReports() });
  return Response.json({ error: "bad_input" }, { status: 400 });
}
