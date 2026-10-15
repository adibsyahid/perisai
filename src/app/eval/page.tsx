"use client";

import { useState } from "react";
import { Database, Trash2 } from "lucide-react";
import { EvalRunner } from "@/components/eval/eval-runner";
import { PageHeader, PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { postApi } from "@/lib/firebase-client";
import { useI18n } from "@/lib/i18n";

// /eval: hidden team page (BLUEPRINT section 9): the AI accuracy run and the
// Radar demo data. Opened by tapping the version in Tetapan 7 times.
export default function EvalPage() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action: "fill" | "clear") {
    setBusy(true);
    setMessage("");
    const { ok, data } = await postApi<{ added?: number; removed?: number }>("/api/demo-data", { action }).catch(
      () => ({ ok: false, data: {} as { added?: number; removed?: number } }),
    );
    if (!ok) setMessage(t.evaluation.failed);
    else if (action === "fill") setMessage(t.evaluation.added.replace("{count}", String(data.added ?? 0)));
    else setMessage(t.evaluation.removed.replace("{count}", String(data.removed ?? 0)));
    setBusy(false);
  }

  return (
    <PageShell>
      <PageHeader title={t.evaluation.title} subtitle={t.evaluation.subtitle} />
      <EvalRunner />
      <SectionCard icon={Database} title={t.evaluation.demoTitle} hint={t.evaluation.demoHint}>
        <Button size="lg" disabled={busy} onClick={() => run("fill")} className="w-full">
          <Database />
          {t.evaluation.fillDemo}
        </Button>
        <Button size="lg" variant="outline" disabled={busy} onClick={() => run("clear")} className="w-full border-2">
          <Trash2 />
          {t.evaluation.clearDemo}
        </Button>
        {message && (
          <p role="status" className="text-base font-semibold">
            {message}
          </p>
        )}
      </SectionCard>
    </PageShell>
  );
}
