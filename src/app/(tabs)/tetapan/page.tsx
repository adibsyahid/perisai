"use client";

import { Check, Languages } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-shell";
import { LOCALES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Tetapan (settings). P0 has the language switch; more settings come later.
export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <PageShell>
      <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />

      <section className="rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgba(11,27,63,0.04),0_8px_24px_-12px_rgba(11,27,63,0.12)]">
        <div className="mb-4 flex items-center gap-3">
          <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
            <Languages className="size-6" />
          </span>
          <div className="leading-snug">
            <h2 id="language-heading" className="text-lg font-bold">
              {t.settings.language}
            </h2>
            <p className="text-base text-muted-foreground">{t.settings.languageHint}</p>
          </div>
        </div>

        <div role="radiogroup" aria-labelledby="language-heading" className="flex flex-col gap-2.5">
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
                onClick={() => setLocale(code)}
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
      </section>
    </PageShell>
  );
}
