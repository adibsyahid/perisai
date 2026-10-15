"use client";

import Link from "next/link";
import { BellRing, ChevronRight } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { VERDICT_STYLE } from "@/components/scan/verdict-style";
import type { Alert } from "@/lib/family-types";
import { useI18n } from "@/lib/i18n";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

const SHOWN = 10;

// Alerts about the people I look after. Each opens the Amaran screen.
export function AlertHistoryCard({ alerts }: { alerts: Alert[] }) {
  const { t, locale } = useI18n();

  return (
    <SectionCard icon={BellRing} title={t.family.alertHistory}>
      {alerts.length === 0 ? (
        <p className="text-base text-muted-foreground">{t.family.alertHistoryEmpty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.slice(0, SHOWN).map((alert) => {
            const style = VERDICT_STYLE[alert.verdict];
            const Icon = style.icon;
            return (
              <li key={alert.id}>
                <Link
                  href={`/amaran/${alert.id}`}
                  className="flex min-h-16 items-center gap-3 rounded-xl border p-3 active:bg-muted"
                >
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", style.pill)}>
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-semibold">
                      {t.alert.received
                        .replace("{name}", alert.protectedName)
                        .replace("{verdict}", t.scan.verdicts[alert.verdict])}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {timeAgo(alert.createdAt, locale)} · {alert.handled ? t.family.handled : t.family.notHandled}
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="size-5 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
