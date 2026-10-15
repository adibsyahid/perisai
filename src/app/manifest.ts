import type { MetadataRoute } from "next";

// Makes PERISAI installable ("Add to Home Screen") on Android and iPhone.
// The manifest is read before the app loads, so it stays in BM (the default language).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PERISAI: Pelindung Keluarga daripada Scam",
    short_name: "PERISAI",
    description: "Imbas mesej mencurigakan dan lindungi keluarga anda daripada scam.",
    lang: "ms",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F7FB",
    theme_color: "#F6F7FB",
    categories: ["security", "utilities"],
    // Puts PERISAI in Android's Share menu (WhatsApp → long-press → Share → PERISAI).
    // GET keeps it simple: the text arrives as URL parameters on /share.
    share_target: {
      action: "/share",
      method: "GET",
      params: { title: "title", text: "text", url: "url" },
    },
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
