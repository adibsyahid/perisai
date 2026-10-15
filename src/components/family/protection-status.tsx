"use client";

import Link from "next/link";
import { ChevronRight, ShieldCheck, UserPlus } from "lucide-react";
import { useFamily } from "@/lib/family-client";
import { useI18n } from "@/lib/i18n";

// Utama status card: "Dilindungi oleh 2 penjaga" or a nudge to invite one.
export function ProtectionStatus() {
  const { t } = useI18n();
  const { ready, guardians } = useFamily();
  if (!ready) return null;

  const protectedNow = guardians.length > 0;
  const Icon = protectedNow ? ShieldCheck : UserPlus;

  return (
    <Link
      href="/keluarga"
      className={
        protectedNow
          ? "flex min-h-16 items-center gap-3 rounded-2xl bg-safe/10 px-4 py-3 text-base font-semibold text-[#15803D]"
          : "flex min-h-16 items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-base font-semibold text-foreground"
      }
    >
      <Icon aria-hidden className="size-6 shrink-0" />
      <span className="flex-1">
        {protectedNow ? t.family.protectedBy.replace("{count}", String(guardians.length)) : t.family.notProtected}
      </span>
      <ChevronRight aria-hidden className="size-5 shrink-0 opacity-70" />
    </Link>
  );
}
