"use client";

import { ScanLine } from "lucide-react";
import { ComingSoonCard, PageShell } from "@/components/page-shell";
import { ShieldMark } from "@/components/shield-mark";
import { useI18n } from "@/lib/i18n";

// Utama (home). The scan inputs arrive in P1; P0 shows the brand and layout.
export default function HomePage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <div className="flex items-center gap-3">
        <ShieldMark />
        <div className="leading-tight">
          <p className="text-xl font-extrabold tracking-[0.08em] text-navy">{t.app.name}</p>
          <p className="text-sm font-medium text-muted-foreground">{t.app.tagline}</p>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-perisai to-navy p-6 text-white shadow-[0_18px_40px_-18px_rgba(29,78,216,0.7)]">
        {/* Large faint shield in the corner: decoration only. */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute -right-8 -bottom-10 size-48 text-white/10"
        >
          <path
            fill="currentColor"
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
          />
        </svg>
        <p className="relative text-base font-semibold text-white/80">{t.home.greeting}</p>
        <h1 className="relative mt-1 text-[1.75rem] leading-tight font-bold tracking-tight">{t.home.title}</h1>
        <p className="relative mt-2 max-w-[22ch] text-white/85">{t.home.subtitle}</p>
      </section>

      <ComingSoonCard icon={ScanLine} text={t.home.placeholder} badge={t.common.comingSoon} />
    </PageShell>
  );
}
