import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { PrefEffects } from "@/components/pref-effects";
import { SwRegister } from "@/components/sw-register";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PERISAI",
  description: "Imbas mesej mencurigakan dan lindungi keluarga anda daripada scam.",
  applicationName: "PERISAI",
  appleWebApp: { capable: true, title: "PERISAI", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F6F7FB",
  // "cover" lets the app draw under the notch; we pad with safe-area insets instead.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ms" className={`${jakarta.variable} h-full`}>
      {/* On a laptop the app sits in a phone-width column, so judges see the mobile design. */}
      <body className="min-h-full bg-[#E4E8F2]">
        <I18nProvider>
          <div className="relative mx-auto min-h-dvh w-full max-w-(--app-max-width) bg-background shadow-[0_0_60px_rgba(11,27,63,0.08)]">
            {children}
          </div>
          <SwRegister />
          <PrefEffects />
        </I18nProvider>
      </body>
    </html>
  );
}
