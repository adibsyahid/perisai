"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Download,
  Info,
  Languages,
  Lock,
  QrCode,
  Radar,
  Share2,
  Type,
  Volume2,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-shell";
import { PrefSwitch } from "@/components/pref-switch";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { LOCALES, useI18n } from "@/lib/i18n";
import { APP_VERSION, useInstalled } from "@/lib/install";
import { syncLocale } from "@/lib/profile";
import { cn } from "@/lib/utils";

const APP_URL = "https://perisai-three.vercel.app";
const TAPS_TO_EVAL = 7;

// Tetapan (BLUEPRINT section 5.8): language, large text, voice, Radar sharing,
// Kongsi PERISAI (QR), install guide, privacy, about, and the hidden eval mode.
export default function SettingsPage() {
  const { t } = useI18n();
  const installed = useInstalled();

  return (
    <PageShell>
      <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />
      <LanguageCard />
      <PrefSwitch pref="largeText" icon={Type} title={t.settings.largeText} hint={t.settings.largeTextHint} />
      <PrefSwitch pref="voice" icon={Volume2} title={t.settings.voice} hint={t.settings.voiceHint} />
      <PrefSwitch pref="radar" icon={Radar} title={t.settings.radarShare} hint={t.settings.radarShareHint} />
      {!installed && (
        <Link href="/pasang" className="block">
          <SectionCard className="active:bg-muted">
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Download className="size-6" />
              </span>
              <span className="min-w-0 flex-1 leading-snug">
                <span className="block text-lg font-bold">{t.settings.installTitle}</span>
                <span className="block text-base text-muted-foreground">{t.settings.installHint}</span>
              </span>
              <ChevronRight aria-hidden className="size-5 text-muted-foreground" />
            </div>
          </SectionCard>
        </Link>
      )}
      <ShareCard />
      <SectionCard icon={Lock} title={t.settings.privacyTitle}>
        <ul className="space-y-2.5">
          {t.settings.privacyPoints.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-base">
              <Check aria-hidden className="mt-1 size-4 shrink-0 text-safe" strokeWidth={3} />
              {point}
            </li>
          ))}
        </ul>
      </SectionCard>
      <AboutCard />
    </PageShell>
  );
}

function LanguageCard() {
  const { t, locale, setLocale } = useI18n();
  return (
    <SectionCard icon={Languages} title={t.settings.language} hint={t.settings.languageHint}>
      <div role="radiogroup" aria-label={t.settings.language} className="flex flex-col gap-2.5">
        {LOCALES.map((code) => {
          const selected = code === locale;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={selected}
              // Each option is labelled in its own language, so anyone can find theirs.
              lang={code}
              onClick={() => {
                setLocale(code);
                // Family alerts are written in the guardian's language, so tell the server too.
                syncLocale(code).catch(() => {});
              }}
              className={cn(
                "flex min-h-16 items-center justify-between gap-3 rounded-xl border-2 px-4 text-left text-lg font-semibold transition-colors",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected ? "border-primary bg-secondary" : "border-border bg-card active:bg-muted",
              )}
            >
              {t.languages[code]}
              {/* A tick, not only a colour, shows which one is chosen. */}
              <span
                aria-hidden
                className={cn(
                  "grid size-7 place-items-center rounded-full border-2",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {selected && <Check className="size-4" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

// Kongsi PERISAI: a QR code family members scan with their camera (made by scripts/make-qr.mjs).
function ShareCard() {
  const { t } = useI18n();
  return (
    <SectionCard icon={QrCode} title={t.settings.shareTitle} hint={t.settings.shareHint}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a tiny static SVG, no optimisation needed */}
      <img
        src="/qr/perisai-qr.svg"
        alt={APP_URL}
        width={220}
        height={220}
        className="mx-auto size-56 rounded-xl border bg-white p-2"
      />
      <p className="text-center font-mono text-base font-semibold break-all text-navy">{APP_URL.replace("https://", "")}</p>
      <Button
        size="lg"
        variant="outline"
        className="w-full border-2"
        onClick={() => {
          const text = t.settings.shareText.replace("{url}", APP_URL);
          if (navigator.share) navigator.share({ text, url: APP_URL }).catch(() => {});
          else navigator.clipboard?.writeText(text).catch(() => {});
        }}
      >
        <Share2 />
        {t.settings.shareButton}
      </Button>
    </SectionCard>
  );
}

// About, plus the hidden door to evaluation mode: tap the version 7 times.
function AboutCard() {
  const { t } = useI18n();
  const router = useRouter();
  const [taps, setTaps] = useState(0);

  return (
    <SectionCard icon={Info} title={t.settings.aboutTitle}>
      <p className="text-base font-semibold text-[#B91C1C]">{t.settings.aboutProblem}</p>
      <p className="text-base">{t.settings.aboutMission}</p>
      <p className="text-base text-muted-foreground">{t.settings.aboutTeam}</p>
      <button
        type="button"
        onClick={() => {
          const next = taps + 1;
          setTaps(next);
          if (next >= TAPS_TO_EVAL) router.push("/eval");
        }}
        className="w-fit text-sm text-muted-foreground"
      >
        {t.settings.version.replace("{version}", APP_VERSION)}
      </button>
    </SectionCard>
  );
}
