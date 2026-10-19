"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Gauge, Pause, Play, RotateCcw, TriangleAlert } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import {
  computeMetrics,
  loadSamples,
  loadSavedResults,
  saveResults,
  toCsv,
  type Sample,
  type SampleResult,
} from "@/lib/evaluation";
import { useI18n } from "@/lib/i18n";
import { runScan, ScanError, type ScanInput } from "@/lib/scan-client";

// One request every 6 s stays under the Gemini free-tier rate limit (4 s hit "busy" on 19 Oct).
const PACE_MS = 6000;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const percent = (value: number) => `${Math.round(value * 100)}%`;

async function toInput(sample: Sample): Promise<ScanInput> {
  if (sample.image) {
    const blob = await (await fetch(sample.image)).blob();
    return { kind: "image", file: new File([blob], sample.id, { type: blob.type }) };
  }
  return { kind: "text", text: sample.text ?? "" };
}

export function EvalRunner() {
  const { t, locale } = useI18n();
  const [samples, setSamples] = useState<Sample[] | null>(null);
  const [results, setResults] = useState<Record<string, SampleResult>>({});
  const [running, setRunning] = useState(false);
  const stopRequested = useRef(false);

  useEffect(() => {
    loadSamples()
      .then((list) => {
        setSamples(list);
        setResults(loadSavedResults());
      })
      .catch(() => setSamples([]));
  }, []);

  if (samples === null) return null;
  if (samples.length === 0) {
    return (
      <SectionCard icon={Gauge} title={t.evaluation.runTitle}>
        <p className="text-base">{t.evaluation.noSamples}</p>
      </SectionCard>
    );
  }

  const scamCount = samples.filter((s) => s.label === "scam").length;
  const legitCount = samples.length - scamCount;
  const current = samples.map((s) => results[s.id]).filter((r): r is SampleResult => !!r);
  const done = current.filter((r) => !r.error).length;
  const metrics = computeMetrics(current);

  async function run() {
    stopRequested.current = false;
    setRunning(true);
    let saved = { ...results };
    // Only samples that have no good answer yet, so "Sambung" retries failures.
    for (const sample of samples!.filter((s) => !saved[s.id] || saved[s.id].error)) {
      if (stopRequested.current) break;
      const started = performance.now();
      let row: SampleResult;
      try {
        const result = await runScan(await toInput(sample), locale, { evaluation: true });
        row = {
          id: sample.id,
          label: sample.label,
          expectedType: sample.scamType ?? "",
          verdict: result.verdict,
          predictedType: result.scamType,
          riskScore: result.riskScore,
          ms: Math.round(performance.now() - started),
          error: "",
        };
      } catch (error) {
        row = {
          id: sample.id,
          label: sample.label,
          expectedType: sample.scamType ?? "",
          verdict: "",
          predictedType: "",
          riskScore: 0,
          ms: 0,
          error: error instanceof ScanError ? error.code : "server",
        };
      }
      saved = { ...saved, [sample.id]: row };
      setResults(saved);
      saveResults(saved);
      await pause(PACE_MS);
    }
    setRunning(false);
  }

  function exportCsv() {
    const blob = new Blob([toCsv(current)], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `perisai-eval-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const usesExamples = samples.some((s) => s.id.startsWith("contoh-"));
  const tooFew = scamCount < 50 || legitCount < 20;

  return (
    <SectionCard icon={Gauge} title={t.evaluation.runTitle} hint={t.evaluation.runHint}>
      <p className="text-base font-semibold">
        {t.evaluation.samplesInfo
          .replace("{total}", String(samples.length))
          .replace("{scams}", String(scamCount))
          .replace("{legit}", String(legitCount))}
      </p>
      {(usesExamples || tooFew) && (
        <p className="flex items-start gap-2 rounded-xl bg-warning/15 p-3 text-base text-[#92400E]">
          <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          {usesExamples ? t.evaluation.examplesWarning : t.evaluation.tooFew}
        </p>
      )}

      <div>
        <div className="mb-1 text-sm text-muted-foreground">
          {t.evaluation.progress.replace("{done}", String(done)).replace("{total}", String(samples.length))}
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={samples.length}
          aria-valuenow={done}
        >
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: percent(done / samples.length) }} />
        </div>
      </div>

      {running ? (
        <Button size="lg" variant="outline" className="w-full border-2" onClick={() => (stopRequested.current = true)}>
          <Pause />
          {t.evaluation.stop}
        </Button>
      ) : (
        <Button size="lg" className="w-full" onClick={run} disabled={done === samples.length}>
          <Play />
          {current.length === 0
            ? t.evaluation.start
            : t.evaluation.resume.replace("{done}", String(done)).replace("{total}", String(samples.length))}
        </Button>
      )}

      {metrics.scored > 0 && (
        <>
          <p className="rounded-xl bg-navy p-4 text-lg leading-snug font-semibold text-white">
            {t.evaluation.headline
              .replace("{tp}", String(metrics.truePositives))
              .replace("{scams}", String(metrics.scams))
              .replace("{fp}", String(metrics.falsePositives))
              .replace("{legit}", String(metrics.legit))}
          </p>
          <dl className="grid grid-cols-2 gap-2.5">
            {[
              [t.evaluation.accuracy, percent(metrics.accuracy)],
              [t.evaluation.recall, percent(metrics.recall)],
              [t.evaluation.precision, percent(metrics.precision)],
              [t.evaluation.falseAlarm, percent(metrics.falseAlarmRate)],
              [t.evaluation.avgTime, `${metrics.avgSeconds.toFixed(1)} s`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border p-3">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-2xl font-extrabold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted-foreground">
            {t.evaluation.strictNote
              .replace("{count}", String(metrics.scamVerdicts))
              .replace("{scams}", String(metrics.scams))}
          </p>
          {metrics.errors > 0 && (
            <p className="text-sm text-[#92400E]">{t.evaluation.errorsNote.replace("{count}", String(metrics.errors))}</p>
          )}

          {metrics.byType.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-base font-bold">{t.evaluation.byType}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="py-1 pr-2 font-semibold">{t.evaluation.colType}</th>
                      <th className="py-1 pr-2 text-right font-semibold">{t.evaluation.colTotal}</th>
                      <th className="py-1 pr-2 text-right font-semibold">{t.evaluation.colDetected}</th>
                      <th className="py-1 text-right font-semibold">{t.evaluation.colTypeMatch}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.byType.map((row) => (
                      <tr key={row.type} className="border-t">
                        <td className="py-1.5 pr-2">{t.scan.types[row.type]}</td>
                        <td className="py-1.5 pr-2 text-right tabular-nums">{row.total}</td>
                        <td className="py-1.5 pr-2 text-right tabular-nums">{row.flagged}</td>
                        <td className="py-1.5 text-right tabular-nums">{row.typeMatched}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button size="lg" variant="outline" className="w-full border-2" onClick={exportCsv}>
            <Download />
            {t.evaluation.exportCsv}
          </Button>
        </>
      )}

      {current.length > 0 && !running && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            setResults({});
            saveResults({});
          }}
        >
          <RotateCcw />
          {t.evaluation.reset}
        </Button>
      )}
    </SectionCard>
  );
}
