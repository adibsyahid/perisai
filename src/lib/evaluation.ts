// Evaluation mode (BLUEPRINT section 9): runs labelled samples through the real
// /api/scan pipeline and turns the answers into numbers for the judges.
import type { ScamType, Verdict } from "./scan-types";

// public/eval/samples.json: one entry per real message, personal details blurred.
export type Sample = {
  id: string;
  label: "scam" | "legit";
  scamType?: ScamType; // the true type, for scam samples
  text?: string; // either text ...
  image?: string; // ... or a picture under /eval/images/
};

export type SampleResult = {
  id: string;
  label: Sample["label"];
  expectedType: ScamType | "";
  verdict: Verdict | "";
  predictedType: ScamType | "";
  riskScore: number;
  ms: number;
  error: string; // empty when the scan worked
};

export async function loadSamples(): Promise<Sample[]> {
  const response = await fetch("/eval/samples.json", { cache: "no-store" });
  if (!response.ok) return [];
  return (await response.json()) as Sample[];
}

// "Flagged" = PERISAI warned the user (SCAM or MENCURIGAKAN). That is what protects
// people, so it is what precision and recall are measured on.
const isFlagged = (verdict: SampleResult["verdict"]) => verdict === "SCAM" || verdict === "MENCURIGAKAN";

export type Metrics = {
  scored: number; // results without errors
  errors: number;
  scams: number;
  legit: number;
  truePositives: number; // scam, flagged
  falseNegatives: number; // scam, missed
  falsePositives: number; // legit, flagged (false alarm)
  trueNegatives: number; // legit, not flagged
  scamVerdicts: number; // scams that got the strongest verdict, SCAM
  accuracy: number;
  precision: number;
  recall: number;
  falseAlarmRate: number;
  avgSeconds: number;
  byType: { type: ScamType; total: number; flagged: number; typeMatched: number }[];
};

const ratio = (part: number, whole: number) => (whole === 0 ? 0 : part / whole);

export function computeMetrics(results: SampleResult[]): Metrics {
  const ok = results.filter((r) => !r.error);
  const scams = ok.filter((r) => r.label === "scam");
  const legit = ok.filter((r) => r.label === "legit");
  const tp = scams.filter((r) => isFlagged(r.verdict)).length;
  const fp = legit.filter((r) => isFlagged(r.verdict)).length;
  const tn = legit.length - fp;
  const fn = scams.length - tp;

  const types = new Map<ScamType, { total: number; flagged: number; typeMatched: number }>();
  for (const r of scams) {
    const type = (r.expectedType || "other") as ScamType;
    const row = types.get(type) ?? { total: 0, flagged: 0, typeMatched: 0 };
    row.total++;
    if (isFlagged(r.verdict)) row.flagged++;
    if (r.predictedType === type) row.typeMatched++;
    types.set(type, row);
  }

  return {
    scored: ok.length,
    errors: results.length - ok.length,
    scams: scams.length,
    legit: legit.length,
    truePositives: tp,
    falseNegatives: fn,
    falsePositives: fp,
    trueNegatives: tn,
    scamVerdicts: scams.filter((r) => r.verdict === "SCAM").length,
    accuracy: ratio(tp + tn, ok.length),
    precision: ratio(tp, tp + fp),
    recall: ratio(tp, scams.length),
    falseAlarmRate: ratio(fp, legit.length),
    avgSeconds: ratio(ok.reduce((sum, r) => sum + r.ms, 0), ok.length) / 1000,
    byType: [...types.entries()]
      .map(([type, row]) => ({ type, ...row }))
      .sort((a, b) => b.total - a.total),
  };
}

// One row per sample, for Excel / Google Sheets.
export function toCsv(results: SampleResult[]): string {
  const header = ["id", "label", "expected_type", "verdict", "predicted_type", "risk_score", "seconds", "error"];
  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const rows = results.map((r) =>
    [r.id, r.label, r.expectedType, r.verdict, r.predictedType, r.riskScore, (r.ms / 1000).toFixed(2), r.error]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

// Results are saved on this phone after every sample, so a long run can be resumed.
const STORAGE_KEY = "perisai.eval.results";

export function loadSavedResults(): Record<string, SampleResult> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, SampleResult>;
  } catch {
    return {};
  }
}

export function saveResults(results: Record<string, SampleResult>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    // Too big or blocked: the run still shows on screen.
  }
}
