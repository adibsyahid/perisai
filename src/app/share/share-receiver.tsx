"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanningView } from "@/components/scan/scanning-view";
import { setPendingScan } from "@/lib/scan-session";

// Joins what the sharing app sent. WhatsApp puts the message in "text";
// browsers send "url" (and a page "title"). The title is often just an app or
// page name, so it is only used when nothing else was shared. Duplicates are dropped.
function sharedText(params: URLSearchParams) {
  const get = (key: string) => params.get(key)?.trim() ?? "";
  const parts = [get("text"), get("url")].filter(Boolean);
  if (parts.length === 0 && get("title")) parts.push(get("title"));
  // Drop a part when a longer part already contains it (e.g. the link inside the text).
  const kept = parts.filter((part) => !parts.some((other) => other.length > part.length && other.includes(part)));
  return [...new Set(kept)].join("\n");
}

export function ShareReceiver() {
  const params = useSearchParams();
  const router = useRouter();
  const text = sharedText(params);

  useEffect(() => {
    if (text) {
      setPendingScan({ type: "new", input: { kind: "text", text } });
      // replace (not push): Back from the result returns to Utama, not to this page.
      router.replace("/imbas");
    } else {
      router.replace("/");
    }
  }, [text, router]);

  return <ScanningView preview="" />;
}
