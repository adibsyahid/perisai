"use client";

import { HeartHandshake } from "lucide-react";
import { ComingSoonCard, PageHeader, PageShell } from "@/components/page-shell";
import { useI18n } from "@/lib/i18n";

// Keluarga (family guardian). Pairing and alerts arrive in P3.
export default function FamilyPage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <PageHeader title={t.family.title} subtitle={t.family.subtitle} />
      <ComingSoonCard icon={HeartHandshake} text={t.family.placeholder} badge={t.common.comingSoon} />
    </PageShell>
  );
}
