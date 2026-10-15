"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BellRing, Check, Radar, ScanLine, Type, type LucideIcon } from "lucide-react";
import { PrefSwitch } from "@/components/pref-switch";
import { fieldClass } from "@/components/section-card";
import { ShieldMark } from "@/components/shield-mark";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { isInstalled } from "@/lib/install";
import { finishOnboarding, setRole, type Role } from "@/lib/onboarding";
import { saveProfile, useProfile } from "@/lib/profile";
import { STATES } from "@/lib/states";
import { cn } from "@/lib/utils";

const SLIDE_ICONS: LucideIcon[] = [ScanLine, BellRing, Radar];
const ROLES: Role[] = ["protect", "guardian", "both"];

// Mula (BLUEPRINT section 5.1): 3 short slides, then role, name, state and large text.
// Everything can be skipped; it all lives in Tetapan and Keluarga too.
export default function OnboardingPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const profile = useProfile();
  const slides = t.onboarding.slides;
  const total = slides.length + 1;
  const [step, setStep] = useState(0);
  const [role, setRoleChoice] = useState<Role>("both");
  const [name, setName] = useState(profile?.name ?? "");
  const [state, setState] = useState(profile?.state ?? "");
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    setRole(role);
    if (name.trim()) {
      // A failed save (e.g. offline) must not trap the user here; Keluarga can retry.
      await saveProfile({ name: name.trim().slice(0, 30), state }, locale).catch(() => {});
    }
    finishOnboarding();
    router.replace(isInstalled() ? "/" : "/pasang");
  }

  function skip() {
    finishOnboarding();
    router.replace("/");
  }

  const onSetup = step === slides.length;

  return (
    <main className="flex min-h-dvh flex-col bg-background px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
      <div className="flex items-center justify-between">
        <ShieldMark className="size-10" />
        {!onSetup && (
          <Button variant="ghost" onClick={skip}>
            {t.onboarding.skip}
          </Button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {t.onboarding.stepOf.replace("{step}", String(step + 1)).replace("{total}", String(total))}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col"
        >
          {onSetup ? (
            <div className="flex flex-col gap-4 pt-6">
              <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">{t.onboarding.setupTitle}</h1>

              <div role="radiogroup" aria-label={t.onboarding.setupTitle} className="flex flex-col gap-2.5">
                {ROLES.map((r) => {
                  const selected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setRoleChoice(r)}
                      className={cn(
                        "flex min-h-16 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
                        selected ? "border-primary bg-secondary" : "border-border bg-card",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-bold">{t.onboarding.roles[r]}</span>
                        <span className="block text-base text-muted-foreground">{t.onboarding.roles[`${r}Hint`]}</span>
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full border-2",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {selected && <Check className="size-4" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="flex flex-col gap-1.5 text-base font-semibold">
                {t.family.nameLabel}
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.family.namePlaceholder}
                  autoComplete="nickname"
                  maxLength={30}
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-base font-semibold">
                {t.family.stateLabel}
                <select value={state} onChange={(e) => setState(e.target.value)} className={fieldClass}>
                  <option value="">{t.family.statePlaceholder}</option>
                  {STATES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <PrefSwitch pref="largeText" icon={Type} title={t.settings.largeText} hint={t.settings.largeTextHint} />
            </div>
          ) : (
            <Slide icon={SLIDE_ICONS[step]} title={slides[step].title} body={slides[step].body} />
          )}
        </motion.section>
      </AnimatePresence>

      <div className="flex flex-col gap-4 pt-6">
        {/* Progress dots: the current one is wider, so it is not shown by colour alone. */}
        <div aria-hidden className="flex justify-center gap-2">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={cn("h-2 rounded-full transition-all", i === step ? "w-7 bg-primary" : "w-2 bg-input")}
            />
          ))}
        </div>
        {onSetup ? (
          <Button size="lg" disabled={saving} onClick={finish} className="w-full">
            {t.onboarding.start}
            <ArrowRight />
          </Button>
        ) : (
          <Button size="lg" onClick={() => setStep(step + 1)} className="w-full">
            {t.onboarding.next}
            <ArrowRight />
          </Button>
        )}
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)} className="w-full">
            {t.onboarding.back}
          </Button>
        )}
      </div>
    </main>
  );
}

function Slide({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <span
        aria-hidden
        className="grid size-40 place-items-center rounded-full bg-linear-to-br from-perisai to-navy text-white shadow-[0_24px_60px_-24px_rgba(29,78,216,0.8)]"
      >
        <Icon className="size-20" strokeWidth={1.75} />
      </span>
      <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">{title}</h1>
      <p className="max-w-[30ch] text-lg text-foreground/80">{body}</p>
    </div>
  );
}
