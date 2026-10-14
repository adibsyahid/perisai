"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircleCheck, ExternalLink, Flag, Home, Phone, ScanLine, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { ScanResult } from "@/lib/scan-types";
import { canSpeak, speak, stopSpeaking } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { VERDICT_STYLE } from "./verdict-style";

function ScoreRing({ score, color, label }: { score: number; color: string; label: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative grid size-24 shrink-0 place-items-center" role="img" aria-label={`${label} ${score}/100`}>
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="7" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
        />
      </svg>
      <span className="text-center leading-none">
        <span className="block text-2xl font-extrabold">{score}</span>
        <span className="text-xs font-semibold opacity-85">{label}</span>
      </span>
    </div>
  );
}

// What gets read aloud: the verdict, the headline, the summary and the first thing to do.
function spokenText(result: ScanResult, verdictWord: string) {
  return [verdictWord, result.headline, result.summary, result.actions[0]].filter(Boolean).join(". ");
}

export function ResultView({
  result,
  fresh,
  onScanAnother,
  onHome,
}: {
  result: ScanResult;
  fresh: boolean; // true right after a scan (not when reopened from history)
  onScanAnother: () => void;
  onHome: () => void;
}) {
  const { t, locale } = useI18n();
  const style = VERDICT_STYLE[result.verdict];
  const Icon = style.icon;
  const verdictWord = t.scan.verdicts[result.verdict];
  const [speaking, setSpeaking] = useState(false);
  const risky = result.verdict === "SCAM" || result.verdict === "MENCURIGAKAN";
  // Only suggest checking numbers when something is off; a safe bank notice
  // also contains the bank's real hotline.
  const hasNumbers =
    result.verdict !== "SELAMAT" &&
    (result.extracted.phones.length > 0 || result.extracted.bankAccounts.length > 0);

  // On a fresh result: buzz for SCAM and read the verdict aloud (elderly users).
  useEffect(() => {
    if (!fresh) return;
    if (result.verdict === "SCAM") navigator.vibrate?.([250, 120, 250]);
    if (canSpeak()) {
      speak(spokenText(result, verdictWord), locale, () => setSpeaking(false));
    }
    return stopSpeaking;
  }, [fresh, result, verdictWord, locale]);

  function toggleVoice() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speak(spokenText(result, verdictWord), locale, () => setSpeaking(false));
    }
  }

  return (
    <main className="min-h-dvh bg-background pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      {/* Verdict banner: the colour floods in from the shield. */}
      <motion.header
        className={cn("relative overflow-hidden px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-7", style.banner)}
        initial={{ clipPath: "circle(0% at 50% 40%)" }}
        animate={{ clipPath: "circle(150% at 50% 40%)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t.common.close}
            onClick={onHome}
            className="text-current hover:bg-black/10"
          >
            <X />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 18 }}
            >
              <Icon aria-hidden className="size-12" strokeWidth={2.2} />
            </motion.div>
            <p className="mt-2 text-[2rem] leading-none font-extrabold tracking-tight">{verdictWord}</p>
            {result.scamType !== "none" && (
              <p className="mt-2 text-base font-semibold opacity-90">{t.scan.types[result.scamType]}</p>
            )}
          </div>
          <ScoreRing score={result.riskScore} color={style.ring} label={t.scan.risk} />
        </div>
      </motion.header>

      <div className="flex flex-col gap-6 px-5 pt-6">
        <section className="space-y-2">
          <h1 className="text-[1.6rem] leading-tight font-bold tracking-tight">{result.headline}</h1>
          <p className="text-lg text-foreground/85">{result.summary}</p>
          {result.impersonatedEntity && (
            <p className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
              {t.scan.impersonating}: <span className="text-primary">{result.impersonatedEntity}</span>
            </p>
          )}
        </section>

        {canSpeak() && (
          <Button variant="outline" size="lg" onClick={toggleVoice} className="w-full border-2">
            {speaking ? <VolumeX /> : <Volume2 />}
            {speaking ? t.scan.stopListening : t.scan.listen}
          </Button>
        )}

        {result.redFlags.length > 0 && (
          <section aria-labelledby="flags-heading" className="space-y-3">
            <h2 id="flags-heading" className="flex items-center gap-2 text-lg font-bold">
              <Flag aria-hidden className="size-5 text-danger" />
              {t.scan.redFlags}
            </h2>
            <ul className="space-y-3">
              {result.redFlags.map((flag, i) => (
                <li key={i} className="rounded-2xl border border-l-4 border-l-danger bg-card p-4">
                  <mark className="rounded-md bg-danger/10 px-1.5 py-0.5 font-semibold break-words text-[#B91C1C] box-decoration-clone">
                    &ldquo;{flag.quote}&rdquo;
                  </mark>
                  <p className="mt-2 text-base text-foreground/85">{flag.reason}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="actions-heading" className="space-y-3">
          <h2 id="actions-heading" className="text-lg font-bold">
            {t.scan.actions}
          </h2>
          <ul className="space-y-2.5 rounded-2xl border bg-card p-4">
            {result.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <CircleCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
                <span className="text-base">{action}</span>
              </li>
            ))}
          </ul>
        </section>

        {risky && (
          <section className="space-y-3 rounded-2xl bg-navy p-5 text-white">
            <p className="text-base font-semibold">{t.scan.hotline}</p>
            <Button
              size="lg"
              className="w-full bg-white text-navy hover:bg-white/90"
              nativeButton={false}
              render={<a href="tel:997" />}
            >
              <Phone />
              {t.scan.callHotline}
            </Button>
          </section>
        )}

        {hasNumbers && (
          <a
            href="https://semakmule.rmp.gov.my"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 bg-card px-4 text-base font-semibold text-primary"
          >
            {t.scan.semakMule}
            <ExternalLink aria-hidden className="size-5 shrink-0" />
          </a>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Button size="lg" onClick={onScanAnother} className="w-full">
            <ScanLine />
            {t.scan.scanAnother}
          </Button>
          <Button size="lg" variant="ghost" onClick={onHome} className="w-full">
            <Home />
            {t.scan.backHome}
          </Button>
        </div>
      </div>
    </main>
  );
}
