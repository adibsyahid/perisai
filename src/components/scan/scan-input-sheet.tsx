"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardPaste, Lock, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type TextMode = "text" | "link" | "number";

// A bottom sheet with one big text box and one big button.
// The parent renders it with a `key`, so each opening starts empty.
export function ScanInputSheet({
  mode,
  onClose,
  onSubmit,
}: {
  mode: TextMode | null;
  onClose: () => void;
  onSubmit: (mode: TextMode, text: string) => void;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const titleId = useId();

  // Close with the Escape key (keyboards, TalkBack users).
  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setValue(text);
    } catch {
      // Paste blocked: the user can still long-press the box and paste.
    }
  }

  const multiline = mode === "text";
  const fieldClass =
    "w-full rounded-xl border-2 border-input bg-card px-4 py-3 text-lg leading-relaxed outline-none placeholder:text-muted-foreground/80 focus:border-primary";

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label={t.common.close} className="absolute inset-0 bg-navy/45" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-(--app-max-width) rounded-t-3xl bg-background px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-xl font-bold">
                {t.input.title[mode]}
              </h2>
              <Button variant="ghost" size="icon-lg" aria-label={t.common.close} onClick={onClose}>
                <X />
              </Button>
            </div>

            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) onSubmit(mode, value);
              }}
            >
              {multiline ? (
                <textarea
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={t.input.placeholder[mode]}
                  aria-labelledby={titleId}
                  rows={6}
                  className={cn(fieldClass, "min-h-44 resize-none")}
                />
              ) : (
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={t.input.placeholder[mode]}
                  aria-labelledby={titleId}
                  inputMode={mode === "number" ? "tel" : "url"}
                  autoCapitalize="off"
                  autoCorrect="off"
                  className={cn(fieldClass, "h-14")}
                />
              )}

              <Button type="button" variant="outline" onClick={pasteFromClipboard}>
                <ClipboardPaste />
                {t.input.paste}
              </Button>

              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
                {t.input.privacy}
              </p>

              <Button type="submit" size="lg" disabled={!value.trim()} className="w-full">
                <ScanLine />
                {t.input.submit}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
