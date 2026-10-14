import { ShieldAlert, ShieldCheck, ShieldQuestion, TriangleAlert, type LucideIcon } from "lucide-react";
import type { Verdict } from "@/lib/scan-types";

// One place for how each verdict looks. Every verdict has an icon AND a word,
// so colour is never the only signal (BLUEPRINT section 4).
// Amber is too light for white text, so the warning banner uses navy text (WCAG AA).
export const VERDICT_STYLE: Record<
  Verdict,
  { icon: LucideIcon; banner: string; pill: string; ring: string }
> = {
  SCAM: {
    icon: ShieldAlert,
    banner: "bg-danger text-white",
    pill: "bg-danger/10 text-[#B91C1C]",
    ring: "#FFFFFF",
  },
  MENCURIGAKAN: {
    icon: TriangleAlert,
    banner: "bg-warning text-navy",
    pill: "bg-warning/15 text-[#92400E]",
    ring: "#0B1B3F",
  },
  SELAMAT: {
    icon: ShieldCheck,
    banner: "bg-safe text-white",
    pill: "bg-safe/10 text-[#15803D]",
    ring: "#FFFFFF",
  },
  TIDAK_PASTI: {
    icon: ShieldQuestion,
    banner: "bg-[#475569] text-white",
    pill: "bg-muted text-muted-foreground",
    ring: "#FFFFFF",
  },
};
