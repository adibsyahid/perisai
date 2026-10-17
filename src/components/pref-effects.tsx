"use client";

import { useEffect } from "react";
import { usePref } from "@/lib/prefs";
import { preloadVoices } from "@/lib/speech";

// App-wide effects. Large text scales the root font size, so every rem-based size
// (text, buttons, spacing) grows together without overflow. Voices are preloaded.
export function PrefEffects() {
  const largeText = usePref("largeText");

  useEffect(() => {
    document.documentElement.toggleAttribute("data-large-text", largeText);
  }, [largeText]);

  // Start loading the phone's voices as soon as PERISAI opens, so the first
  // verdict is read aloud without waiting (Android and iPhone).
  useEffect(() => {
    preloadVoices();
  }, []);

  return null;
}
