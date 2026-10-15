"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FlaskConical, Lock, ShieldAlert, TriangleAlert } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-shell";
import { RadarMap } from "@/components/radar/radar-map";
import { useI18n } from "@/lib/i18n";
import { countByState, topTypes, useRadar } from "@/lib/radar-client";
import { stateName } from "@/lib/states";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

const card = "rounded-2xl border border-white/10 bg-white/[0.04] p-4";
const FEED_SIZE = 10;

// Radar Scam (BLUEPRINT F4): the dark "command centre", live from Firestore.
export default function RadarPage() {
  const { t, locale } = useI18n();
  const { reports, now } = useRadar();

  // Dark phone status bar while Radar is on screen; restored when leaving.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previous = meta?.content;
    meta?.setAttribute("content", "#07122B");
    return () => {
      if (meta && previous) meta.setAttribute("content", previous);
    };
  }, []);
  const list = reports ?? [];
  const latest = list[0];
  const counts = countByState(list);
  const types = topTypes(list);
  const maxType = types[0]?.[1] ?? 1;
  const hasDemo = list.some((r) => r.isDemo);

  return (
    <PageShell tone="dark">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={t.radar.title} subtitle={t.radar.subtitle} tone="dark" />
        <span className="mt-2 inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
          <span aria-hidden className="relative grid size-2.5 place-items-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#F87171]/70" />
            <span className="relative inline-flex size-2 rounded-full bg-[#F87171]" />
          </span>
          {t.radar.live}
        </span>
      </div>

      {hasDemo && (
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/10 px-3 py-1 text-sm font-semibold text-[#FDE68A]">
          <FlaskConical aria-hidden className="size-4" />
          {t.radar.demoChip}
        </p>
      )}

      {/* National counter. The number pops each time it goes up. */}
      <section className={cn(card, "flex items-end justify-between gap-3")}>
        <div>
          <p className="text-base text-white/75">{t.radar.counter}</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={list.length}
              className="text-5xl font-extrabold tracking-tight tabular-nums"
              initial={{ scale: 1.25, color: "#FCA5A5" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              aria-live="polite"
            >
              {reports === null ? "–" : list.length.toLocaleString(locale === "ms" ? "ms-MY" : "en-MY")}
            </motion.p>
          </AnimatePresence>
        </div>
        <ShieldAlert aria-hidden className="size-10 text-[#F87171]" />
      </section>

      <section className={cn(card, "px-2 py-3")}>
        <RadarMap counts={counts} latestState={latest?.state} latestId={latest?.id} />
      </section>

      {reports !== null && list.length === 0 && <p className="text-base text-white/75">{t.radar.empty}</p>}

      {types.length > 0 && (
        <section className={cn(card, "space-y-3")}>
          <h2 className="text-lg font-bold">{t.radar.topTypes}</h2>
          <ol className="space-y-2.5">
            {types.map(([type, count]) => (
              <li key={type}>
                <div className="mb-1 flex justify-between gap-3 text-base">
                  <span className="font-medium text-white/90">{t.scan.types[type]}</span>
                  <span className="font-bold tabular-nums">{count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-[#EF4444] to-[#F87171]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxType) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {list.length > 0 && (
        <section className={cn(card, "space-y-3")}>
          <h2 className="text-lg font-bold">{t.radar.feed}</h2>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {list.slice(0, FEED_SIZE).map((report) => {
                const Icon = report.verdict === "SCAM" ? ShieldAlert : TriangleAlert;
                return (
                  <motion.li
                    key={report.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3"
                  >
                    <Icon
                      aria-hidden
                      className={cn("mt-0.5 size-5 shrink-0", report.verdict === "SCAM" ? "text-[#F87171]" : "text-[#FBBF24]")}
                    />
                    <span className="min-w-0 flex-1 text-base leading-snug">
                      {t.radar.feedItem
                        .replace("{type}", t.scan.types[report.scamType])
                        .replace("{state}", stateName(report.state) || t.radar.unknownState)}
                      <span className="block text-sm text-white/60">{timeAgo(report.createdAt, locale, now)}</span>
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </section>
      )}

      <footer className="space-y-1 text-sm text-white/60">
        <p className="flex items-start gap-1.5">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
          {t.radar.anonymous}
        </p>
        <p>{t.radar.mapCredit}</p>
      </footer>
    </PageShell>
  );
}
