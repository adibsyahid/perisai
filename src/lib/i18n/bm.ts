// Bahasa Melayu is the default language and the source of truth for keys.
// en.ts must have exactly the same shape (TypeScript checks this).
export const bm = {
  app: {
    name: "PERISAI",
    tagline: "Pelindung keluarga daripada scam",
  },
  nav: {
    label: "Navigasi utama",
    home: "Utama",
    family: "Keluarga",
    radar: "Radar",
    settings: "Tetapan",
  },
  common: {
    comingSoon: "Sedang dibina",
  },
  home: {
    greeting: "Selamat datang",
    title: "Ragu dengan mesej?",
    subtitle: "Imbas dulu sebelum klik, bayar atau balas.",
    placeholder: "Imbas mesej, gambar dan pautan akan muncul di sini tidak lama lagi.",
  },
  family: {
    title: "Keluarga",
    subtitle: "Jaga ibu bapa dan orang tersayang dari jauh.",
    placeholder: "Sambung telefon ahli keluarga untuk dapat amaran segera.",
  },
  radar: {
    title: "Radar Scam",
    subtitle: "Scam yang sedang aktif di seluruh Malaysia.",
    placeholder: "Peta scam masa nyata akan dipaparkan di sini.",
  },
  settings: {
    title: "Tetapan",
    subtitle: "Ubah bahasa dan cara PERISAI berfungsi.",
    language: "Bahasa",
    languageHint: "Pilih bahasa paparan aplikasi.",
    version: "Versi",
  },
  languages: {
    ms: "Bahasa Melayu",
    en: "English",
  },
} as const;

// Widen the literal strings so en.ts can hold different text in the same shape.
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dictionary = Widen<typeof bm>;
