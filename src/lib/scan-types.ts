// Shapes shared by the phone (client) and /api/scan (server).

export const VERDICTS = ["SCAM", "MENCURIGAKAN", "SELAMAT", "TIDAK_PASTI"] as const;
export type Verdict = (typeof VERDICTS)[number];

export const SCAM_TYPES = [
  "parcel",
  "authority_impersonation",
  "job",
  "investment",
  "loan",
  "phishing",
  "malicious_apk",
  "impersonation",
  "romance",
  "online_purchase",
  "prize",
  "govt_aid",
  "other",
  "none",
] as const;
export type ScamType = (typeof SCAM_TYPES)[number];

// What the user asked us to check. It decides how the content is framed for Gemini.
export type ScanKind = "text" | "link" | "number" | "image";

export type ScanRequest = {
  kind: ScanKind;
  lang: "ms" | "en";
  text?: string;
  image?: { data: string; mimeType: string }; // base64, already resized on the phone
  radar?: boolean; // false = the user turned off anonymous Radar reports in Tetapan
};

export type RedFlag = { quote: string; reason: string };

export type ScanResult = {
  verdict: Verdict;
  riskScore: number;
  scamType: ScamType;
  headline: string;
  summary: string;
  redFlags: RedFlag[];
  actions: string[];
  impersonatedEntity: string;
  extracted: { urls: string[]; phones: string[]; bankAccounts: string[] };
};

// Error codes the API returns; the phone turns them into friendly i18n messages.
export type ScanErrorCode = "auth" | "rate_limited" | "busy" | "bad_input" | "server";
