"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { setPref, usePref, type PrefKey } from "@/lib/prefs";
import { cn } from "@/lib/utils";

// A big on/off row for one preference. The whole row is the switch (easy to tap),
// and the knob position plus the colour both show the state.
export function PrefSwitch({
  pref,
  icon: Icon,
  title,
  hint,
}: {
  pref: PrefKey;
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  const on = usePref(pref);
  const hintId = useId();

  return (
    <SectionCard>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={title}
        aria-describedby={hintId}
        onClick={() => setPref(pref, !on)}
        className="flex min-h-14 w-full items-center gap-3 text-left"
      >
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-6" />
        </span>
        <span className="min-w-0 flex-1 leading-snug">
          <span className="block text-lg font-bold">{title}</span>
          <span id={hintId} className="block text-base text-muted-foreground">
            {hint}
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            "relative h-8 w-14 shrink-0 rounded-full transition-colors",
            on ? "bg-primary" : "bg-input",
          )}
        >
          <span
            className={cn(
              "absolute top-1 size-6 rounded-full bg-white shadow transition-transform",
              on ? "translate-x-7" : "translate-x-1",
            )}
          />
        </span>
      </button>
    </SectionCard>
  );
}
