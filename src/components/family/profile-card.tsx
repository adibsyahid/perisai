"use client";

import { useState } from "react";
import { MapPin, Pencil, UserRound } from "lucide-react";
import { fieldClass, SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { saveProfile, type LocalProfile } from "@/lib/profile";
import { STATES, stateName } from "@/lib/states";

// Name + state. Needed before pairing, because the other person sees this name.
export function ProfileCard({ profile }: { profile: LocalProfile | null }) {
  const { t, locale } = useI18n();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [state, setState] = useState(profile?.state ?? "");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  if (profile && !editing) {
    return (
      <SectionCard>
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-primary">
            <UserRound className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{profile.name}</p>
            {profile.state && (
              <p className="flex items-center gap-1 text-base text-muted-foreground">
                <MapPin aria-hidden className="size-4" />
                {stateName(profile.state)}
              </p>
            )}
          </div>
          <Button variant="ghost" onClick={() => setEditing(true)}>
            <Pencil />
            {t.family.edit}
          </Button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard icon={UserRound} title={t.family.profileTitle} hint={t.family.profileHint}>
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setSaving(true);
          setFailed(false);
          try {
            await saveProfile({ name: name.trim().slice(0, 30), state }, locale);
            setEditing(false);
          } catch {
            setFailed(true);
          } finally {
            setSaving(false);
          }
        }}
      >
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
        {failed && (
          <p role="alert" className="text-base text-[#B91C1C]">
            {t.family.errors.server}
          </p>
        )}
        <Button type="submit" disabled={!name.trim() || saving} className="w-full">
          {t.family.save}
        </Button>
      </form>
    </SectionCard>
  );
}
