"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { CircleCheck, Home, Phone, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { fieldClass } from "@/components/section-card";
import { VERDICT_STYLE } from "@/components/scan/verdict-style";
import { Button } from "@/components/ui/button";
import { getPhones, savePhone } from "@/lib/family-client";
import type { Alert } from "@/lib/family-types";
import { clientDb, ensureUser, postApi } from "@/lib/firebase-client";
import { useI18n } from "@/lib/i18n";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

export function AlertFromUrl() {
  const { id } = useParams<{ id: string }>();
  // Keyed by id, so opening a different alert starts a fresh screen.
  return <AlertScreen key={id} id={id} />;
}

// Amaran (guardian side): who, what, when, and one huge Call button.
function AlertScreen({ id }: { id: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [alert, setAlert] = useState<Alert | null | "missing">(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState("");
  const [marking, setMarking] = useState(false);

  // Live: if another guardian marks it as contacted, this screen updates too.
  useEffect(() => {
    let stop = () => {};
    ensureUser().then(() => {
      stop = onSnapshot(
        doc(clientDb(), "alerts", id),
        (snap) => setAlert(snap.exists() ? ({ id: snap.id, ...snap.data() } as Alert) : "missing"),
        () => setAlert("missing"), // not ours (rules) or offline
      );
    });
    return () => stop();
  }, [id]);

  useEffect(() => {
    if (alert && alert !== "missing") getPhones().then((phones) => setPhone(phones[alert.protectedUid] ?? ""));
  }, [alert]);

  if (alert === null) return <main className="min-h-dvh bg-background" aria-busy="true" />;

  if (alert === "missing") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-xl font-semibold">{t.alert.notFound}</p>
        <Button size="lg" onClick={() => router.replace("/keluarga")}>
          <Home />
          {t.scan.backHome}
        </Button>
      </main>
    );
  }

  const style = VERDICT_STYLE[alert.verdict];
  const name = alert.protectedName;

  return (
    <main className="min-h-dvh bg-background pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <motion.header
        className={cn("px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-8", style.banner)}
        initial={{ clipPath: "circle(0% at 50% 30%)" }}
        animate={{ clipPath: "circle(150% at 50% 30%)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-base font-semibold opacity-90">{t.alert.title}</p>
        <ShieldAlert aria-hidden className="mt-3 size-12" />
        <h1 className="mt-2 text-[1.75rem] leading-tight font-extrabold">
          {t.alert.received.replace("{name}", name).replace("{verdict}", t.scan.verdicts[alert.verdict])}
        </h1>
        <p className="mt-2 text-lg font-semibold opacity-90">{t.scan.types[alert.scamType]}</p>
        <p className="mt-1 text-base opacity-85">{timeAgo(alert.createdAt, locale)}</p>
      </motion.header>

      <div className="flex flex-col gap-5 px-5 pt-6">
        {alert.headline && <p className="text-lg font-semibold">&ldquo;{alert.headline}&rdquo;</p>}
        <p className="text-lg">{t.alert.advice.replace("{name}", name)}</p>

        {phone ? (
          <Button
            size="lg"
            className="h-20 w-full text-2xl"
            nativeButton={false}
            render={<a href={`tel:${phone}`} />}
          >
            <Phone className="size-7" />
            {t.family.call.replace("{name}", name)}
          </Button>
        ) : (
          phone === "" && (
            <form
              className="flex flex-col gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newPhone.trim()) return;
                await savePhone(alert.protectedUid, newPhone);
                setPhone(newPhone.replace(/[^\d+]/g, ""));
              }}
            >
              <label className="flex flex-col gap-1.5 text-base font-semibold">
                {t.family.phoneLabel}
                <input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="012-345 6789"
                  className={fieldClass}
                />
              </label>
              <Button type="submit" size="lg" disabled={!newPhone.trim()}>
                {t.family.addPhone}
              </Button>
            </form>
          )
        )}

        {alert.handled ? (
          <p role="status" className="flex items-start gap-2 rounded-2xl bg-safe/10 p-4 text-base font-semibold text-[#15803D]">
            <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
            {t.alert.handledDone}
          </p>
        ) : (
          <Button
            size="lg"
            variant="outline"
            disabled={marking}
            className="w-full border-2"
            onClick={async () => {
              setMarking(true);
              await postApi("/api/alerts/handled", { alertId: alert.id }).catch(() => null);
              setMarking(false);
            }}
          >
            <CircleCheck />
            {t.alert.markHandled}
          </Button>
        )}

        <Button size="lg" variant="ghost" onClick={() => router.replace("/keluarga")} className="w-full">
          <Home />
          {t.scan.backHome}
        </Button>
      </div>
    </main>
  );
}
