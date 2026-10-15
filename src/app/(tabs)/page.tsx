"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardPaste, Hash, ImageUp, Info, Link2, MessageSquareText, ScanLine } from "lucide-react";
import { ProtectionStatus } from "@/components/family/protection-status";
import { PageShell } from "@/components/page-shell";
import { RecentScans } from "@/components/scan/recent-scans";
import { ScanInputSheet, type TextMode } from "@/components/scan/scan-input-sheet";
import { ShieldMark } from "@/components/shield-mark";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { ScanInput } from "@/lib/scan-client";
import { setPendingScan } from "@/lib/scan-session";

// Utama (home): every way to start a scan, plus the latest results.
export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [sheet, setSheet] = useState<TextMode | null>(null);
  const [sheetKey, setSheetKey] = useState(0);
  const [notice, setNotice] = useState("");

  function startScan(input: ScanInput) {
    setPendingScan({ type: "new", input });
    router.push("/imbas");
  }

  function openSheet(mode: TextMode) {
    setNotice("");
    setSheetKey((k) => k + 1); // a fresh, empty sheet every time
    setSheet(mode);
  }

  const closeSheet = useCallback(() => setSheet(null), []);

  // One tap for the common case: the message is already copied (also the iPhone flow).
  async function pasteAndScan() {
    setNotice("");
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) startScan({ kind: "text", text });
      else setNotice(t.home.clipboardEmpty);
    } catch {
      setNotice(t.home.clipboardDenied);
    }
  }

  // The screenshot tile is a <label> for a hidden file input, so the phone's own
  // picker opens on tap; the others open the text sheet.
  const tiles = [
    { mode: "text", label: t.home.tiles.text, icon: MessageSquareText },
    { mode: "image", label: t.home.tiles.image, icon: ImageUp },
    { mode: "link", label: t.home.tiles.link, icon: Link2 },
    { mode: "number", label: t.home.tiles.number, icon: Hash },
  ] as const;
  const tileClass =
    "flex min-h-28 cursor-pointer flex-col items-start justify-between gap-3 rounded-2xl border bg-card p-4 text-left text-base leading-snug font-semibold shadow-[0_1px_2px_rgba(11,27,63,0.04)] transition-colors active:bg-muted has-focus-visible:outline-2 has-focus-visible:outline-ring";

  return (
    <PageShell>
      <div className="flex items-center gap-3">
        <ShieldMark />
        <div className="leading-tight">
          <p className="text-xl font-extrabold tracking-[0.08em] text-navy">{t.app.name}</p>
          <p className="text-sm font-medium text-muted-foreground">{t.app.tagline}</p>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-perisai to-navy p-6 text-white shadow-[0_18px_40px_-18px_rgba(29,78,216,0.7)]">
        {/* Large faint shield in the corner: decoration only. */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute -top-6 -right-10 size-48 text-white/10"
        >
          <path
            fill="currentColor"
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
          />
        </svg>
        <p className="relative text-base font-semibold text-white/80">{t.home.greeting}</p>
        <h1 className="relative mt-1 text-[1.75rem] leading-tight font-bold tracking-tight">{t.home.title}</h1>
        <p className="relative mt-2 max-w-[24ch] text-white/85">{t.home.subtitle}</p>
        <Button
          size="lg"
          onClick={() => openSheet("text")}
          className="relative mt-5 w-full bg-white text-navy shadow-lg hover:bg-white/90"
        >
          <ScanLine />
          {t.home.scanNow}
        </Button>
      </section>

      <ProtectionStatus />

      <div className="flex flex-col gap-2">
        <Button size="lg" variant="outline" onClick={pasteAndScan} className="w-full border-2 border-primary/30 bg-card text-primary">
          <ClipboardPaste />
          {t.home.pasteAndScan}
        </Button>
        <p className="text-center text-sm text-muted-foreground">{t.home.pasteAndScanHint}</p>
        {notice && (
          <p role="status" className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-base text-navy">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
            {notice}
          </p>
        )}
      </div>

      <section aria-labelledby="ways-heading" className="flex flex-col gap-3">
        <h2 id="ways-heading" className="text-lg font-bold">
          {t.home.otherWays}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ mode, label, icon: Icon }) => {
            const content = (
              <>
                <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-6" />
                </span>
                {label}
              </>
            );
            return mode === "image" ? (
              <label key={mode} className={tileClass}>
                {content}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = ""; // allow choosing the same picture again later
                    if (file) startScan({ kind: "image", file });
                  }}
                />
              </label>
            ) : (
              <button key={mode} type="button" onClick={() => openSheet(mode)} className={tileClass}>
                {content}
              </button>
            );
          })}
        </div>
      </section>

      {/* Keyed by bfcacheId so the list reloads each time we come back to Utama. */}
      <RecentScans
        key={router.bfcacheId}
        onOpen={(id) => {
          setPendingScan({ type: "history", id });
          router.push("/imbas");
        }}
      />

      <ScanInputSheet
        key={sheetKey}
        mode={sheet}
        onClose={closeSheet}
        onSubmit={(mode, text) => {
          setSheet(null);
          startScan({ kind: mode, text });
        }}
      />
    </PageShell>
  );
}
