// Link heuristics (BLUEPRINT F1). Plain rules that run on the server before Gemini.
// They catch the classic tricks even if the AI is unsure, and they are easy to explain.

export type HeuristicFlag =
  | "apk"
  | "ip_host"
  | "punycode"
  | "brand_lookalike"
  | "shortener"
  | "risky_tld"
  | "no_https";

export const FLAG_POINTS: Record<HeuristicFlag, number> = {
  apk: 30,
  ip_host: 20,
  punycode: 20,
  brand_lookalike: 25,
  shortener: 10,
  risky_tld: 10,
  no_https: 5,
};

const BRANDS = [
  "poslaju", "pos", "maybank", "cimb", "rhb", "bankislam", "publicbank", "tng", "touchngo",
  "lhdn", "hasil", "jpj", "pdrm", "kwsp", "shopee", "lazada",
];

const OFFICIAL_DOMAINS = [
  "pos.com.my", "poslaju.com.my", "maybank2u.com.my", "maybank.com", "cimbclicks.com.my", "cimb.com.my",
  "rhbgroup.com", "bankislam.com", "pbebank.com", "publicbank.com.my", "hasil.gov.my", "jpj.gov.my",
  "rmp.gov.my", "kwsp.gov.my", "touchngo.com.my", "tngdigital.com.my", "shopee.com.my", "lazada.com.my",
];

const SHORTENERS = ["bit.ly", "tinyurl.com", "s.id", "cutt.ly", "t.ly", "rb.gy", "shorturl.at"];
const RISKY_TLDS = [".xyz", ".top", ".icu", ".click", ".vip", ".buzz"];

// Finds links with or without "http", e.g. "poslaju-my.xyz/track".
const URL_PATTERN =
  /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"']*)?|\bhttps?:\/\/\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?(?:\/[^\s<>"']*)?/gi;
const APK_PATTERN = /\b[\w.-]+\.apk\b/i;

export function findUrls(text: string): string[] {
  const found = text.match(URL_PATTERN) ?? [];
  // Trailing punctuation belongs to the sentence, and .apk names are handled by their own rule.
  return [...new Set(found.map((url) => url.replace(/[.,)!?]+$/, "")))].filter((url) => !/\.apk$/i.test(url));
}

function hostOf(url: string): string {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `http://${url}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isOfficial(host: string) {
  return host.endsWith(".gov.my") || OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

function mentionsBrand(host: string) {
  const parts = host.split(/[.-]/);
  // Short brands ("pos", "tng") must be a whole word, or "post" and "positive" would match.
  return BRANDS.some((brand) => parts.some((part) => part === brand || (brand.length >= 4 && part.includes(brand))));
}

export type HeuristicResult = {
  score: number;
  flags: { code: HeuristicFlag; quote: string }[];
  urls: string[];
};

export function checkLinks(text: string): HeuristicResult {
  const flags: HeuristicResult["flags"] = [];
  const add = (code: HeuristicFlag, quote: string) => {
    if (!flags.some((f) => f.code === code)) flags.push({ code, quote });
  };

  const apk = text.match(APK_PATTERN);
  if (apk) add("apk", apk[0]);

  const urls = findUrls(text);
  for (const url of urls) {
    const host = hostOf(url);
    if (!host) continue;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) add("ip_host", url);
    if (host.split(".").some((label) => label.startsWith("xn--"))) add("punycode", url);
    if (mentionsBrand(host) && !isOfficial(host)) add("brand_lookalike", url);
    if (SHORTENERS.includes(host)) add("shortener", url);
    if (RISKY_TLDS.some((tld) => host.endsWith(tld))) add("risky_tld", url);
    if (/^http:\/\//i.test(url)) add("no_https", url);
  }

  const score = Math.min(100, flags.reduce((sum, f) => sum + FLAG_POINTS[f.code], 0));
  return { score, flags, urls };
}
