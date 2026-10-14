"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Radar, Settings, UsersRound, type LucideIcon } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/bm";
import { cn } from "@/lib/utils";

type Tab = { href: string; icon: LucideIcon; label: keyof Dictionary["nav"] };

const TABS: Tab[] = [
  { href: "/", icon: House, label: "home" },
  { href: "/keluarga", icon: UsersRound, label: "family" },
  { href: "/radar", icon: Radar, label: "radar" },
  { href: "/tetapan", icon: Settings, label: "settings" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  // The Radar tab is a dark "command centre", so the bar turns dark with it.
  const dark = pathname.startsWith("/radar");

  return (
    <nav
      aria-label={t.nav.label}
      className={cn(
        "fixed bottom-0 left-1/2 z-40 w-full max-w-(--app-max-width) -translate-x-1/2 border-t backdrop-blur-xl transition-colors",
        "pb-[env(safe-area-inset-bottom)]",
        dark ? "border-white/10 bg-[#0A1736]/90" : "border-border bg-white/90",
      )}
    >
      {/* reducedMotion="user" turns the sliding pill off when the phone asks for less motion. */}
      <MotionConfig reducedMotion="user">
        <ul className="grid h-(--nav-height) grid-cols-4">
          {TABS.map(({ href, icon: Icon, label }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-sm font-semibold transition-colors",
                    "focus-visible:outline-2 focus-visible:-outline-offset-4",
                    active
                      ? dark
                        ? "text-white"
                        : "text-primary"
                      : dark
                        ? "text-white/65"
                        : "text-muted-foreground",
                  )}
                >
                  <span className="relative grid h-8 w-16 place-items-center">
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className={cn("absolute inset-0 rounded-full", dark ? "bg-white/12" : "bg-secondary")}
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <Icon aria-hidden className="relative size-6" strokeWidth={active ? 2.4 : 2} />
                  </span>
                  {t.nav[label]}
                </Link>
              </li>
            );
          })}
        </ul>
      </MotionConfig>
    </nav>
  );
}
