// Makes the PERISAI QR code once: an SVG for the app's "Kongsi PERISAI" screen and a
// large PNG for the poster and video. Run again only if the app URL changes:
//   node scripts/make-qr.mjs
import { mkdir } from "node:fs/promises";
import QRCode from "qrcode";

const URL = "https://perisai-three.vercel.app";
// Error correction "H" survives print smudges and a logo sticker in the middle.
const options = { errorCorrectionLevel: "H", margin: 2, color: { dark: "#0B1B3F", light: "#FFFFFF" } };

await mkdir("public/qr", { recursive: true });
await QRCode.toFile("public/qr/perisai-qr.svg", URL, { ...options, type: "svg" });
await QRCode.toFile("public/qr/perisai-qr-poster.png", URL, { ...options, type: "png", width: 1600 });
console.log(`QR codes for ${URL} written to public/qr/`);
