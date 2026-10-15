"use client";

import { useEffect, useState } from "react";
import { HeartHandshake, KeyRound, Phone } from "lucide-react";
import { fieldClass, SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { getPhones, savePhone } from "@/lib/family-client";
import type { Guardianship } from "@/lib/family-types";
import { postApi } from "@/lib/firebase-client";
import { useI18n } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/bm";

type JoinReply = { protectedName?: string; protectedUid?: string; error?: keyof Dictionary["family"]["errors"] };

// "Saya jaga": the people I look after, each with a big Call button,
// and the form to enter a new invite code.
export function ProtectingCard({ protecting, hasProfile }: { protecting: Guardianship[]; hasProfile: boolean }) {
  const { t } = useI18n();
  const [phones, setPhones] = useState<Record<string, string>>({});
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getPhones().then(setPhones);
  }, []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { ok, data } = await postApi<JoinReply>("/api/pair/join", { code }).catch(() => ({
      ok: false,
      data: { error: "server" } as JoinReply,
    }));
    if (ok && data.protectedUid) {
      if (phone.trim()) {
        await savePhone(data.protectedUid, phone);
        setPhones(await getPhones());
      }
      setMessage({ ok: true, text: t.family.joined.replace("{name}", data.protectedName ?? "") });
      setCode("");
      setPhone("");
    } else {
      setMessage({ ok: false, text: t.family.errors[data.error ?? "server"] ?? t.family.errors.server });
    }
    setBusy(false);
  }

  return (
    <SectionCard icon={HeartHandshake} title={t.family.protecting}>
      {protecting.length === 0 ? (
        <p className="text-base text-muted-foreground">{t.family.protectingEmpty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {protecting.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 rounded-xl bg-muted p-3">
              <p className="text-lg font-semibold">{p.protectedName}</p>
              {phones[p.protectedUid] ? (
                <Button size="lg" className="w-full" nativeButton={false} render={<a href={`tel:${phones[p.protectedUid]}`} />}>
                  <Phone />
                  {t.family.call.replace("{name}", p.protectedName)}
                </Button>
              ) : (
                <PhoneForm
                  onSave={async (value) => {
                    await savePhone(p.protectedUid, value);
                    setPhones(await getPhones());
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={join} className="flex flex-col gap-3 border-t pt-4">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <KeyRound aria-hidden className="size-5 text-primary" />
          {t.family.enterCode}
        </h3>
        <label className="flex flex-col gap-1.5 text-base font-semibold">
          {t.family.codeLabel}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            className={`${fieldClass} font-mono text-2xl tracking-[0.3em]`}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-base font-semibold">
          {t.family.phoneLabel}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="012-345 6789"
            className={fieldClass}
          />
          <span className="text-sm font-normal text-muted-foreground">{t.family.phoneHint}</span>
        </label>
        {message && (
          <p role="status" className={message.ok ? "text-base font-semibold text-[#15803D]" : "text-base text-[#B91C1C]"}>
            {message.text}
          </p>
        )}
        <Button type="submit" size="lg" disabled={code.length !== 6 || busy || !hasProfile} className="w-full">
          {t.family.join}
        </Button>
        {!hasProfile && <p className="text-sm text-muted-foreground">{t.family.errors.no_profile}</p>}
      </form>
    </SectionCard>
  );
}

function PhoneForm({ onSave }: { onSave: (phone: string) => Promise<void> }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (value.trim()) await onSave(value);
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputMode="tel"
        placeholder="012-345 6789"
        aria-label={t.family.phoneLabel}
        className={fieldClass}
      />
      <Button type="submit" disabled={!value.trim()}>
        {t.family.addPhone}
      </Button>
    </form>
  );
}
