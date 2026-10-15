"use client";

// First-launch state and the role chosen on the Mula screen. Kept on this phone only.
import { useSyncExternalStore } from "react";

export type Role = "protect" | "guardian" | "both";

const DONE_KEY = "perisai.onboarded";
const ROLE_KEY = "perisai.role";
const listeners = new Set<() => void>();

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode: onboarding simply shows again next time.
  }
  listeners.forEach((notify) => notify());
}

export const isOnboarded = () => read(DONE_KEY) === "1";
export const finishOnboarding = () => write(DONE_KEY, "1");
export const setRole = (role: Role) => write(ROLE_KEY, role);

export function useRole(): Role {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => (read(ROLE_KEY) as Role | null) ?? "both",
    () => "both",
  );
}
