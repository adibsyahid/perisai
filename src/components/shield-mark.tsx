import { cn } from "@/lib/utils";

// The PERISAI logo: the same shield and tick as the app icon (scripts/make-icons.mjs).
export function ShieldMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-11 place-items-center rounded-xl bg-linear-to-br from-[#2563EB] to-navy shadow-[0_6px_16px_-6px_rgba(29,78,216,0.6)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[62%]">
        <path
          d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
          fill="#fff"
        />
        <path
          d="m9 12 2 2 4-4"
          fill="none"
          stroke="#1D4ED8"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
