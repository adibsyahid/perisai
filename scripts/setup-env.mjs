// Copies the Firebase Admin credentials from the downloaded service account JSON
// into .env.local, so nobody has to open or copy-paste the private key by hand.
// It never prints the key. Run it yourself:
//   node scripts/setup-env.mjs "C:\Users\acer_\perisai-secrets\<file>.json"
import { readFile, writeFile } from "node:fs/promises";

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node scripts/setup-env.mjs "<path to service account .json>"');
  process.exit(1);
}

const account = JSON.parse(await readFile(jsonPath, "utf8"));
let env = await readFile(".env.local", "utf8");

// Catch the easy mistake of using a key from a different Firebase project.
const projectId = env.match(/^NEXT_PUBLIC_FIREBASE_PROJECT_ID=(.*)$/m)?.[1]?.trim();
if (projectId && account.project_id !== projectId) {
  console.error(`This key is for project "${account.project_id}", but .env.local uses "${projectId}".`);
  process.exit(1);
}

// Store the key on one line with \n escapes; Next.js turns them back into newlines.
const privateKey = JSON.stringify(account.private_key);

function setVar(name, value) {
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  // A function replacement stops "$" inside the key being treated as a special pattern.
  env = pattern.test(env) ? env.replace(pattern, () => line) : `${env.trimEnd()}\n${line}\n`;
}

setVar("FIREBASE_CLIENT_EMAIL", account.client_email);
setVar("FIREBASE_PRIVATE_KEY", privateKey);
await writeFile(".env.local", env);

console.log("OK: FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY saved in .env.local (values not shown).");
