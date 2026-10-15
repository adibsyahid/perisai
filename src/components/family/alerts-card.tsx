"use client";

import { useEffect, useState } from "react";
import { BellRing, CircleCheck, Info } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { enablePush, pushStatus, type PushStatus } from "@/lib/push-client";

// "Hidupkan amaran": lets this phone receive family alerts.
export function AlertsCard() {
  const { t } = useI18n();
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    pushStatus().then(setStatus);
  }, []);

  if (status === null) return null;

  const message = {
    on: t.family.alertsOn,
    off: t.family.alertsOff,
    blocked: t.family.alertsBlocked,
    unsupported: t.family.alertsUnsupported,
    "ios-install": t.family.iosInstallFirst,
  }[status];

  return (
    <SectionCard icon={BellRing} title={t.family.alertsTitle}>
      <p className="flex items-start gap-2 text-base">
        {status === "on" ? (
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-safe" />
        ) : (
          <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
        )}
        {message}
      </p>
      {status === "off" && (
        <Button
          size="lg"
          disabled={busy}
          className="w-full"
          onClick={async () => {
            setBusy(true);
            setStatus(await enablePush().catch(() => "off" as const));
            setBusy(false);
          }}
        >
          <BellRing />
          {t.family.enableAlerts}
        </Button>
      )}
    </SectionCard>
  );
}
