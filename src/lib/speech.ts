// Reads the verdict aloud with the phone's built-in voice (Web Speech API).
// BM voice first; many phones lack ms-MY, and Indonesian is close enough to understand.
const VOICE_ORDER = { ms: ["ms-MY", "ms", "id-ID", "id", "en-US"], en: ["en-GB", "en-US", "en"] };

function pickVoice(lang: "ms" | "en") {
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  for (const wanted of VOICE_ORDER[lang]) {
    const match = voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(wanted.toLowerCase()));
    if (match) return match;
  }
  return undefined;
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Android Chrome and iPhones both load their voice list in the background, so the
// first verdict could wait for it. Called once when the app opens (no tap needed):
// by the time a scan finishes, the Malay/Indonesian voice is already known.
let cachedVoices: SpeechSynthesisVoice[] = [];
export function preloadVoices() {
  if (!canSpeak()) return;
  const load = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  load();
  window.speechSynthesis.addEventListener("voiceschanged", load);
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
  const synth = window.speechSynthesis;
  // Only stop what is already playing: an unneeded cancel() right before speak()
  // can delay or drop the next utterance in Chrome.
  if (synth.speaking || synth.pending) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? (lang === "ms" ? "ms-MY" : "en-US");
  utterance.rate = 0.9; // a little slower for elderly listeners
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  synth.speak(utterance);
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
