// Reads the verdict aloud with the phone's built-in voice (Web Speech API).
// BM voice first; many phones lack ms-MY, and Indonesian is close enough to understand.
const VOICE_ORDER = { ms: ["ms-MY", "ms", "id-ID", "id", "en-US"], en: ["en-GB", "en-US", "en"] };

function pickVoice(lang: "ms" | "en") {
  const voices = window.speechSynthesis.getVoices();
  for (const wanted of VOICE_ORDER[lang]) {
    const match = voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(wanted.toLowerCase()));
    if (match) return match;
  }
  return undefined;
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let warmedUp = false;

// iPhones load their voice list slowly and only start the speech engine after a tap.
// Call this INSIDE the tap that starts a scan: it begins loading the voices and speaks
// one silent utterance, so the verdict can be read aloud the moment it arrives.
export function warmUpSpeech() {
  if (!canSpeak() || warmedUp) return;
  warmedUp = true;
  window.speechSynthesis.getVoices();
  const silent = new SpeechSynthesisUtterance(" ");
  silent.volume = 0;
  window.speechSynthesis.speak(silent);
}

export function speak(text: string, lang: "ms" | "en", onEnd?: () => void) {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? (lang === "ms" ? "ms-MY" : "en-US");
  utterance.rate = 0.9; // a little slower for elderly listeners
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
