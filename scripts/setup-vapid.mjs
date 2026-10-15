// Creates the Web Push (VAPID) key pair for family alerts and saves it in .env.local.
// The private key is never printed. Run it yourself, once:
//   node scripts/setup-vapid.mjs
// Then copy the two VAPID lines from .env.local into Vercel → Settings → Environment Variables.
import { readFile, writeFile } from "node:fs/promises";
import webpush from "web-push";

let env = await readFile(".env.local", "utf8");
if (/^VAPID_PRIVATE_KEY=.+$/m.test(env)) {
  console.log("VAPID keys already exist in .env.local. Nothing changed.");
  process.exit(0);
}

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

function setVar(name, value) {
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  env = pattern.test(env) ? env.replace(pattern, () => line) : `${env.trimEnd()}\n${line}\n`;
}

setVar("NEXT_PUBLIC_VAPID_PUBLIC_KEY", publicKey); // public by design: phones need it to subscribe
setVar("VAPID_PRIVATE_KEY", privateKey); // SECRET: signs the pushes on our server
await writeFile(".env.local", env);

console.log("OK: NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY saved in .env.local (private key not shown).");
