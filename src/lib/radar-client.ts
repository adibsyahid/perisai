"use client";

// Live Radar data: every anonymous report from the last 7 days (BLUEPRINT F4).
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { clientDb, ensureUser } from "./firebase-client";
import type { ScamType, Verdict } from "./scan-types";

export type Report = {
  id: string;
  scamType: ScamType;
  verdict: Verdict;
  state: string;
  createdAt: number;
  isDemo: boolean;
};

const WEEK = 7 * 24 * 60 * 60 * 1000;

export function useRadar() {
  const [reports, setReports] = useState<Report[] | null>(null);
  // "Now" is kept in state and refreshed every 30 s, so "2 min lalu" stays correct.
  const [now, setNow] = useState(0);

  useEffect(() => {
    let stop = () => {};
    let cancelled = false;
    const since = Date.now() - WEEK;

    ensureUser().then(() => {
      if (cancelled) return;
      stop = onSnapshot(
        query(collection(clientDb(), "reports"), where("createdAt", ">=", since)),
        (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
          setReports(rows.sort((a, b) => b.createdAt - a.createdAt));
          setNow(Date.now());
        },
        () => setReports([]), // offline: show an empty radar rather than spin forever
      );
    });

    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      cancelled = true;
      stop();
      clearInterval(timer);
    };
  }, []);

  return { reports, now };
}

// How many reports per state, e.g. { selangor: 12, pahang: 3 }.
export function countByState(reports: Report[]) {
  const counts: Record<string, number> = {};
  for (const r of reports) if (r.state) counts[r.state] = (counts[r.state] ?? 0) + 1;
  return counts;
}

// The most common scam types, biggest first.
export function topTypes(reports: Report[], limit = 5) {
  const counts = new Map<ScamType, number>();
  for (const r of reports) if (r.scamType !== "none") counts.set(r.scamType, (counts.get(r.scamType) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}
