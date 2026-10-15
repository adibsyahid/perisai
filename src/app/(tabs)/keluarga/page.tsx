"use client";

import { AlertHistoryCard } from "@/components/family/alert-history-card";
import { AlertsCard } from "@/components/family/alerts-card";
import { GuardiansCard } from "@/components/family/guardians-card";
import { ProfileCard } from "@/components/family/profile-card";
import { ProtectingCard } from "@/components/family/protecting-card";
import { PageHeader, PageShell } from "@/components/page-shell";
import { useFamily } from "@/lib/family-client";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";

// Keluarga (Penjaga Keluarga, BLUEPRINT F3). One screen for both roles:
// a protected person invites guardians; a guardian enters codes and gets alerts.
export default function FamilyPage() {
  const { t } = useI18n();
  const profile = useProfile();
  const family = useFamily();

  return (
    <PageShell>
      <PageHeader title={t.family.title} subtitle={t.family.subtitle} />
      <ProfileCard key={profile ? "saved" : "new"} profile={profile} />
      <AlertsCard />
      <GuardiansCard guardians={family.guardians} hasProfile={!!profile} />
      <ProtectingCard protecting={family.protecting} hasProfile={!!profile} />
      {family.protecting.length > 0 && <AlertHistoryCard alerts={family.alerts} />}
    </PageShell>
  );
}
