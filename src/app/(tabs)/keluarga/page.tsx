"use client";

import { AlertHistoryCard } from "@/components/family/alert-history-card";
import { AlertsCard } from "@/components/family/alerts-card";
import { GuardiansCard } from "@/components/family/guardians-card";
import { ProfileCard } from "@/components/family/profile-card";
import { ProtectingCard } from "@/components/family/protecting-card";
import { PageHeader, PageShell } from "@/components/page-shell";
import { useFamily } from "@/lib/family-client";
import { useI18n } from "@/lib/i18n";
import { useRole } from "@/lib/onboarding";
import { useProfile } from "@/lib/profile";

// Keluarga (Penjaga Keluarga, BLUEPRINT F3). One screen for both roles:
// a protected person invites guardians; a guardian enters codes and gets alerts.
export default function FamilyPage() {
  const { t } = useI18n();
  const profile = useProfile();
  const family = useFamily();
  const role = useRole();

  const guardians = <GuardiansCard key="guardians" guardians={family.guardians} hasProfile={!!profile} />;
  const protecting = <ProtectingCard key="protecting" protecting={family.protecting} hasProfile={!!profile} />;

  return (
    <PageShell>
      <PageHeader title={t.family.title} subtitle={t.family.subtitle} />
      <ProfileCard key={profile ? "saved" : "new"} profile={profile} />
      <AlertsCard />
      {/* A guardian (chosen on Mula) sees "Saya jaga" first. */}
      {role === "guardian" ? [protecting, guardians] : [guardians, protecting]}
      {family.protecting.length > 0 && <AlertHistoryCard alerts={family.alerts} />}
    </PageShell>
  );
}
