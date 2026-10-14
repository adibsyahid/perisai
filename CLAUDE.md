# PERISAI: project guide for Claude Code

PERISAI is an AI-powered **family anti-scam app for Malaysia**. It is an installable web app (PWA)
built with **Next.js + TypeScript**, so it runs on every phone (Android and iPhone) from one codebase.
It is our entry for **i3EC'26** (Tertiary Student, Innovative Product category).
Team leader and main developer: Ahmad Adib Syahid (Kolej Profesional MARA Beranang).
**Hard deadline:** the demo video and poster must be submitted by **23 Oct 2026**. Aim for 22 Oct.

> **Stack change (8 Oct 2026):** we moved from Flutter to a PWA so anyone can use PERISAI on any phone
> without an app store. The Flutter P0 is kept in git (tag `flutter-p0`). Don't use Flutter or Dart.
> PROGRESS.md may still describe the old Flutter P0. Rewrite it during the new P0.

## Read these first, every session
1. `PROGRESS.md`: what is done, what comes next, known issues.
2. `BLUEPRINT.md`: read **only the section for the current phase** plus anything it links to.
   Don't load the whole blueprint unless the task needs it. This saves tokens.

## How we work
- Work **one phase at a time**, in BLUEPRINT order. Split each phase into small steps. The app must build after every step.
- Ahmad is a diploma CS student who also does freelance web work. After each step, explain in 2 to 4 short sentences
  of simple Bahasa Melayu what you did, and tell him **exactly what to test on his phone**.
- **Ask before** you: add a package that BLUEPRINT doesn't list, add a feature outside BLUEPRINT,
  change the data model, or do anything that costs money.
- Some tasks only Ahmad can do: creating accounts (GitHub, Vercel, Firebase, Google AI Studio), clicking in web
  consoles, pasting secrets into `.env.local` or Vercel, and testing on his phone. For these, **stop, give numbered
  click-by-click steps, and wait** for him to say done. Never ask him to paste secrets into the chat.
- You may use the desktop app's Browser pane with a mobile viewport to check the UI yourself before asking Ahmad.
- After every step, `npm run lint` and `npx tsc --noEmit` must be clean. At the end of a phase, `npm run build` must pass.
- After every finished step, commit: `git add -A && git commit -m "P<n>: <what changed>"`.
  Push to GitHub once the remote exists, so Vercel deploys.
- At the end of every phase or session, **update `PROGRESS.md`** with: done / next / known issues /
  what Ahmad must do / the current live URL. A fresh session should be able to continue from this file alone.
- Keep the code **simple and readable**, because the team has to explain it to the judges.
  Prefer small components and plain functions. Comments explain *why*, not *what*.
- All user-facing text comes from the i18n dictionary. Bahasa Melayu is the default and English is second.
  Never hardcode UI strings.
- **Privacy is a selling point.** Never store or log raw messages, screenshots, or phone numbers on the server.
  See BLUEPRINT section 7.

## Commands
- Dev server: `npm run dev` (http://localhost:3000). For push/PWA testing on the laptop: `npx next dev --experimental-https`.
- Check: `npm run lint` and `npx tsc --noEmit`
- Production build: `npm run build`
- Phone testing: use the **Vercel deployment URL** (HTTPS) in Chrome on Android, or Safari on iPhone.

## Environment
- Windows laptop. Test phone: OPPO A92 (Android 11, ColorOS 11.1), using Chrome. iPhone testing goes through teammates.
- The project must **not** be inside a OneDrive folder.
