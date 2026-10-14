import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

// Every tab page uses this wrapper so the padding clears the notch at the top
// and the bottom navigation (plus the gesture bar) at the bottom.
export function PageShell({ tone = "light", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col gap-6 px-5",
        "pt-[calc(env(safe-area-inset-top)+1.5rem)]",
        "pb-[calc(var(--nav-height)+env(safe-area-inset-bottom)+1.5rem)]",
        tone === "dark" && "bg-radar text-white",
      )}
    >
      {children}
    </main>
  );
}

export function PageHeader({ title, subtitle, tone = "light" }: { title: string; subtitle: string; tone?: Tone }) {
  return (
    <header className="space-y-1.5">
      <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">{title}</h1>
      <p className={cn(tone === "dark" ? "text-white/75" : "text-muted-foreground")}>{subtitle}</p>
    </header>
  );
}

// Placeholder for features built in later phases. The badge has an icon and a word,
// so the status never depends on colour alone.
export function ComingSoonCard({
  icon: Icon,
  text,
  badge,
  tone = "light",
}: {
  icon: LucideIcon;
  text: string;
  badge: string;
  tone?: Tone;
}) {
  const dark = tone === "dark";
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border p-6",
        dark ? "border-white/10 bg-white/5" : "bg-card shadow-[0_1px_2px_rgba(11,27,63,0.04),0_8px_24px_-12px_rgba(11,27,63,0.12)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-14 place-items-center rounded-2xl",
          dark ? "bg-perisai/25 text-[#93B4FF]" : "bg-secondary text-primary",
        )}
      >
        <Icon className="size-7" strokeWidth={2} />
      </span>
      <p className={cn("text-lg leading-snug font-medium", dark ? "text-white/90" : "text-foreground")}>{text}</p>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
          dark ? "bg-white/10 text-white/85" : "bg-muted text-muted-foreground",
        )}
      >
        <Construction aria-hidden className="size-4" />
        {badge}
      </span>
    </section>
  );
}
