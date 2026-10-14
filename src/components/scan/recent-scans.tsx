"use client";

import { useEffect, useState } from "react";
import { ChevronRight, History, ImageIcon } from "lucide-react";
import { loadHistory, type HistoryItem } from "@/lib/history";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { VERDICT_STYLE } from "./verdict-style";

const SHOWN = 5;

export function RecentScans({ onOpen }: { onOpen: (id: string) => void }) {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    loadHistory().then((all) => setItems(all.slice(0, SHOWN)));
  }, []);

  if (items === null) return null; // still loading from IndexedDB

  const timeFormat = new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
      <h2 id="recent-heading" className="text-lg font-bold">
        {t.home.recent}
      </h2>

      {items.length === 0 ? (
        <p className="flex items-start gap-3 rounded-2xl border border-dashed bg-card/60 p-4 text-base text-muted-foreground">
          <History aria-hidden className="mt-0.5 size-5 shrink-0" />
          {t.home.recentEmpty}
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => {
            const style = VERDICT_STYLE[item.result.verdict];
            const Icon = style.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpen(item.id)}
                  className="flex min-h-18 w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-left transition-colors active:bg-muted"
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", style.pill)}>
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <span className={cn("rounded-full px-2 py-0.5", style.pill)}>
                        {t.scan.verdicts[item.result.verdict]}
                      </span>
                      <span className="font-medium text-muted-foreground">{timeFormat.format(item.createdAt)}</span>
                    </span>
                    <span className="mt-1 block truncate text-base font-semibold">{item.result.headline}</span>
                    <span className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                      {item.kind === "image" && <ImageIcon aria-hidden className="size-4 shrink-0" />}
                      {item.kind === "image" ? t.scan.screenshot : item.preview}
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
