"use client";

import { useI18n } from "@/lib/i18n";
import { MAP_HEIGHT, MAP_STATES, MAP_WIDTH } from "@/lib/radar-map";
import { stateName } from "@/lib/states";

// Dark "command centre" map of Malaysia. Each state gets a glowing dot sized by
// its report count; the state of the newest report sends out a pulse.
export function RadarMap({
  counts,
  latestState,
  latestId,
}: {
  counts: Record<string, number>;
  latestState?: string;
  latestId?: string;
}) {
  const { t } = useI18n();
  const max = Math.max(1, ...Object.values(counts));
  // Square-root scale: area grows with the count, so big states don't swamp the map.
  const radius = (count: number) => 3.5 + Math.sqrt(count / max) * 13;

  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={t.radar.mapLabel} className="h-auto w-full">
      <defs>
        <radialGradient id="dot-glow">
          <stop offset="0%" stopColor="#F87171" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F87171" stopOpacity="0" />
        </radialGradient>
      </defs>

      {MAP_STATES.map((state) => (
        <path
          key={state.id}
          d={state.d}
          fill={counts[state.id] ? "#13306B" : "#0E2250"}
          stroke="#2B4C9B"
          strokeWidth={0.6}
          strokeLinejoin="round"
        >
          <title>{t.radar.stateCount.replace("{state}", stateName(state.id)).replace("{count}", String(counts[state.id] ?? 0))}</title>
        </path>
      ))}

      {MAP_STATES.filter((s) => counts[s.id])
        // Small dots last, so they stay visible on top of big ones.
        .sort((a, b) => counts[b.id] - counts[a.id])
        .map((state) => {
          const r = radius(counts[state.id]);
          return (
            <g key={state.id} aria-hidden>
              <circle cx={state.cx} cy={state.cy} r={r * 2.4} fill="url(#dot-glow)" />
              <circle cx={state.cx} cy={state.cy} r={r} fill="#EF4444" fillOpacity={0.85} stroke="#FCA5A5" strokeWidth={0.8} />
            </g>
          );
        })}

      {/* The newest report pulses (CSS .radar-pulse); a new id restarts the animation. */}
      {latestState &&
        MAP_STATES.filter((s) => s.id === latestState).map((state) => (
          <circle
            key={latestId}
            aria-hidden
            className="radar-pulse"
            cx={state.cx}
            cy={state.cy}
            r={34}
            fill="none"
            stroke="#FCA5A5"
            strokeWidth={1.5}
          />
        ))}
    </svg>
  );
}
