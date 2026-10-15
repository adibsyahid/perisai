"use client";

import { useEffect, useState } from "react";
import { Share2, ShieldCheck, UserPlus } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import type { Guardianship } from "@/lib/family-types";
import { postApi } from "@/lib/firebase-client";
import { useI18n } from "@/lib/i18n";

type Code = { code: string; expiresAt: number };

// "Penjaga saya": who looks after me, plus the invite code for a new guardian.
export function GuardiansCard({ guardians, hasProfile }: { guardians: Guardianship[]; hasProfile: boolean }) {
  const { t } = useI18n();
  const [code, setCode] = useState<Code | null>(null);
  const [error, setError] = useState("");
  // Set when a code is made (Next.js may not read the clock while prerendering).
  const [now, setNow] = useState(0);

  // Tick every 15 s while a code is shown, for the "expires in" text.
  useEffect(() => {
    if (!code) return;
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [code]);

  async function makeCode() {
    setError("");
    const { ok, data } = await postApi<Code & { error?: string }>("/api/pair/create", {}).catch(() => ({
      ok: false,
      data: { error: "server" } as Code & { error?: string },
    }));
    if (ok) {
      setCode(data);
      setNow(Date.now());
    } else {
      setError(data.error === "no_profile" ? t.family.errors.no_profile : t.family.errors.server);
    }
  }

  const minutesLeft = code ? Math.ceil((code.expiresAt - now) / 60_000) : 0;
  const expired = code !== null && minutesLeft <= 0;

  return (
    <SectionCard icon={ShieldCheck} title={t.family.myGuardians}>
      {guardians.length === 0 ? (
        <p className="text-base text-muted-foreground">{t.family.myGuardiansEmpty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {guardians.map((g) => (
            <li key={g.id} className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-lg font-semibold">
              <ShieldCheck aria-hidden className="size-5 text-safe" />
              {g.guardianName}
            </li>
          ))}
        </ul>
      )}

      {code && !expired ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-secondary/60 p-5 text-center">
          <p className="text-base font-semibold">{t.family.codeTitle}</p>
          <p className="font-mono text-5xl font-extrabold tracking-[0.2em] text-navy" aria-live="polite">
            {code.code}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.family.codeExpires.replace("{minutes}", String(minutesLeft))}
          </p>
          <p className="text-base">{t.family.codeHint}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const text = t.family.shareCodeText.replace("{code}", code.code).replace("{url}", location.origin);
              // Share sheet where available (phones), otherwise copy the text.
              if (navigator.share) navigator.share({ text }).catch(() => {});
              else navigator.clipboard?.writeText(text).catch(() => {});
            }}
          >
            <Share2 />
            {t.family.shareCode}
          </Button>
        </div>
      ) : (
        <>
          {expired && <p className="text-base text-muted-foreground">{t.family.codeExpired}</p>}
          <Button size="lg" className="w-full" disabled={!hasProfile} onClick={makeCode}>
            <UserPlus />
            {expired ? t.family.newCode : t.family.invite}
          </Button>
        </>
      )}
      {!hasProfile && <p className="text-sm text-muted-foreground">{t.family.errors.no_profile}</p>}
      {error && (
        <p role="alert" className="text-base text-[#B91C1C]">
          {error}
        </p>
      )}
    </SectionCard>
  );
}
