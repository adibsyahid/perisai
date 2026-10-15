"use client";

import { useEffect } from "react";
import { usePref } from "@/lib/prefs";

// Applies app-wide preferences to the page. Large text scales the root font size,
// so every rem-based size (text, buttons, spacing) grows together without overflow.
export function PrefEffects() {
  const largeText = usePref("largeText");

  useEffect(() => {
    document.documentElement.toggleAttribute("data-large-text", largeText);
  }, [largeText]);

  return null;
}
