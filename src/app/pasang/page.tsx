"use client";

import { useRouter } from "next/navigation";
import { CircleCheck, Download, Home, Smartphone } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useInstalled } from "@/lib/install";
import { promptInstall, useCanPromptInstall } from "@/lib/install-prompt";

// Pasang (BLUEPRINT section 5.2): how to put PERISAI on the home screen.
// Android gets a one-tap button when Chrome allows it; iPhone gets clear steps.
export default function InstallPage() {
  const { t } = useI18n();
  const router = useRouter();
  const installed = useInstalled();
  const canPrompt = useCanPromptInstall();

  return (
    <PageShell>
      <PageHeader title={t.install.title} subtitle={t.install.subtitle} />

      {installed ? (
        <p role="status" className="flex items-start gap-2 rounded-2xl bg-safe/10 p-4 text-lg font-semibold text-[#15803D]">
          <CircleCheck aria-hidden className="mt-0.5 size-6 shrink-0" />
          {t.install.alreadyInstalled}
        </p>
      ) : (
        <>
          <SectionCard icon={Smartphone} title={t.install.androidTitle}>
            {canPrompt && (
              <Button size="lg" className="w-full" onClick={() => promptInstall()}>
                <Download />
                {t.install.androidPrompt}
              </Button>
            )}
            <Steps steps={t.install.androidSteps} />
          </SectionCard>
          <SectionCard icon={Smartphone} title={t.install.iosTitle}>
            <Steps steps={t.install.iosSteps} />
          </SectionCard>
        </>
      )}

      <Button size="lg" variant="ghost" onClick={() => router.replace("/")} className="w-full">
        <Home />
        {t.scan.backHome}
      </Button>
    </PageShell>
  );
}

function Steps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={step} className="flex items-start gap-3 text-base">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            {i + 1}
          </span>
          <span className="pt-1">{step}</span>
        </li>
      ))}
    </ol>
  );
}
