"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, WifiOff } from "lucide-react";
import { ResultView } from "@/components/scan/result-view";
import { ScanningView } from "@/components/scan/scanning-view";
import { Button } from "@/components/ui/button";
import { addToHistory, findInHistory } from "@/lib/history";
import { useI18n } from "@/lib/i18n";
import { previewOf, runScan, ScanError, type ClientErrorCode, type ScanInput } from "@/lib/scan-client";
import { peekPendingScan, takePendingScan } from "@/lib/scan-session";
import type { ScanResult } from "@/lib/scan-types";

type State =
  | { phase: "scanning"; preview: string }
  | { phase: "result"; result: ScanResult; fresh: boolean }
  | { phase: "error"; code: ClientErrorCode; input: ScanInput };

// Imbas: runs the scan handed over from Utama, then shows the verdict.
// Lives outside the (tabs) group so it can use the whole screen.
//
// Next.js 16 keeps recently visited pages alive (hidden) to make "back" instant.
// Every new visit here must be a NEW scan, so we key the screen by bfcacheId:
// a push/replace navigation gives a new id and therefore a fresh component.
export default function ScanPage() {
  const { bfcacheId } = useRouter();
  return <ScanScreen key={bfcacheId} />;
}

function ScanScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [state, setState] = useState<State>(() => {
    const pending = peekPendingScan();
    return { phase: "scanning", preview: pending?.type === "new" ? previewOf(pending.input) : "" };
  });
  const started = useRef(false);

  // Runs the scan and returns the screen to show next (result or error).
  async function finishScan(input: ScanInput): Promise<State> {
    try {
      const result = await runScan(input, locale);
      await addToHistory({ kind: input.kind, preview: previewOf(input), result });
      return { phase: "result", result, fresh: true };
    } catch (error) {
      return { phase: "error", code: error instanceof ScanError ? error.code : "server", input };
    }
  }

  function retry(input: ScanInput) {
    setState({ phase: "scanning", preview: previewOf(input) });
    finishScan(input).then(setState);
  }

  useEffect(() => {
    // React runs effects twice in development; the ref makes sure we scan once.
    if (started.current) return;
    started.current = true;

    const pending = takePendingScan();
    if (!pending) {
      router.replace("/"); // opened directly or after a reload: nothing to scan
      return;
    }
    if (pending.type === "history") {
      findInHistory(pending.id).then((item) =>
        item ? setState({ phase: "result", result: item.result, fresh: false }) : router.replace("/"),
      );
    } else {
      finishScan(pending.input).then(setState);
    }
    // Runs once on arrival; `finishScan` and `router` are stable enough for that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.phase === "scanning") return <ScanningView preview={state.preview} />;

  if (state.phase === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <span aria-hidden className="grid size-20 place-items-center rounded-3xl bg-warning/15 text-[#92400E]">
          <WifiOff className="size-10" />
        </span>
        <p role="alert" className="max-w-sm text-xl leading-snug font-semibold">
          {t.scan.errors[state.code]}
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button size="lg" onClick={() => retry(state.input)} className="w-full">
            <RotateCcw />
            {t.scan.tryAgain}
          </Button>
          <Button size="lg" variant="ghost" onClick={() => router.replace("/")} className="w-full">
            {t.scan.backHome}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <ResultView
      result={state.result}
      fresh={state.fresh}
      onScanAnother={() => router.replace("/")}
      onHome={() => router.replace("/")}
    />
  );
}
