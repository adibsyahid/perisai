"use client";

import { MapPinned } from "lucide-react";
import { ComingSoonCard, PageHeader, PageShell } from "@/components/page-shell";
import { useI18n } from "@/lib/i18n";

// Radar Scam: the dark "command centre". The live map arrives in P4.
export default function RadarPage() {
  const { t } = useI18n();

  return (
    <PageShell tone="dark">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={t.radar.title} subtitle={t.radar.subtitle} tone="dark" />
        {/* Pulsing beacon: a preview of the radar dots. Stops under reduced motion. */}
        <span aria-hidden className="relative mt-3 grid size-4 shrink-0 place-items-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#60A5FA]/60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-[#60A5FA]" />
        </span>
      </div>
      <ComingSoonCard icon={MapPinned} text={t.radar.placeholder} badge={t.common.comingSoon} tone="dark" />
    </PageShell>
  );
}
