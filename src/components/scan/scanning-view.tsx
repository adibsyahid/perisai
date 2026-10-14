"use client";

import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";

const SHIELD =
  "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z";

// Shield "scanning" pulse while we wait for the verdict (BLUEPRINT section 4).
export function ScanningView({ preview }: { preview: string }) {
  const { t } = useI18n();

  return (
    <main
      aria-busy="true"
      className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-linear-to-b from-navy to-[#12306F] px-6 text-center text-white"
    >
      <div className="relative grid size-48 place-items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-[#60A5FA]/60"
            initial={{ scale: 0.55, opacity: 0.9 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
          />
        ))}
        <motion.svg
          aria-hidden
          viewBox="0 0 24 24"
          className="relative size-28 drop-shadow-[0_10px_30px_rgba(96,165,250,0.55)]"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d={SHIELD} fill="#FFFFFF" />
          {/* A scan line sweeping across the shield. */}
          <motion.rect
            x="5"
            width="14"
            height="1.6"
            rx="0.8"
            fill="#1D4ED8"
            animate={{ y: [5, 18, 5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      </div>

      <div className="space-y-2">
        <p role="status" className="text-2xl font-bold">
          {t.scan.checking}
        </p>
        <p className="text-white/75">{t.scan.checkingHint}</p>
      </div>

      {preview && (
        <p className="line-clamp-3 max-w-sm rounded-2xl bg-white/10 px-4 py-3 text-base text-white/85">
          &ldquo;{preview}&rdquo;
        </p>
      )}
    </main>
  );
}
