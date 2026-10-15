import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// The white card used across the app, with an optional icon + title row.
export function SectionCard({
  icon: Icon,
  title,
  hint,
  className,
  children,
}: {
  icon?: LucideIcon;
  title?: string;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgba(11,27,63,0.04),0_8px_24px_-12px_rgba(11,27,63,0.12)]",
        className,
      )}
    >
      {title && (
        <div className="flex items-center gap-3">
          {Icon && (
            <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="size-6" />
            </span>
          )}
          <div className="leading-snug">
            <h2 className="text-lg font-bold">{title}</h2>
            {hint && <p className="text-base text-muted-foreground">{hint}</p>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

// Shared look for text boxes and selects, big enough for elderly fingers.
export const fieldClass =
  "h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg outline-none placeholder:text-muted-foreground/80 focus:border-primary";
