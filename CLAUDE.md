# PERISAI: project guide for Claude Code

PERISAI is an AI-powered **family anti-scam app for Malaysia**, built with Flutter + Firebase.
It is our entry for **i3EC'26** (Tertiary Student, Innovative Product category).
Team leader and main developer: Ahmad Adib Syahid (Kolej Profesional MARA Beranang).
**Hard deadline:** the demo video and poster must be submitted by **23 Oct 2026**.

## Read these first, every session
1. `PROGRESS.md`: what is done, what comes next, known issues. Create it in Phase 0 if it doesn't exist.
2. `BLUEPRINT.md`: read **only the section for the current phase** plus anything it links to.
   Don't load the whole blueprint unless the task needs it. This saves tokens.

## How we work
- Work **one phase at a time**, in the order BLUEPRINT gives. Split each phase into small steps.
  The app must compile after every step.
- Ahmad knows Flutter basics (he built SpendSmart). After each step, explain in 2 to 4 short
  sentences what you did, using simple Bahasa Melayu, and tell him **exactly what to test on his phone**.
- **Ask before** you: add a package that BLUEPRINT doesn't list, add a feature outside
  BLUEPRINT, change the data model, or do anything that costs money (for example the Firebase Blaze plan).
- Some tasks only Ahmad can do: creating the Firebase project, clicking in the Firebase console,
  running the app on his phone, and approving permissions. For these, **stop, give numbered
  click-by-click steps, and wait** for him to say done.
- After every step, `flutter analyze` must show no errors. Fix any warnings you introduced.
- After every finished step, commit: `git add -A && git commit -m "P<n>: <what changed>"`.
- At the end of every phase or session, **update `PROGRESS.md`** with: done / next / known issues /
  what Ahmad must do. A fresh session should be able to continue from this file alone.
- Keep the code **simple and readable**, because the team has to explain it to the judges.
  Prefer small files and plain widgets over clever abstractions. Comments explain *why*, not *what*.
- All user-facing text goes through the l10n files. Bahasa Melayu is the default and English is second.
  Never hardcode UI strings.
- **No secrets in code.** Gemini is called through Firebase AI Logic, so the app needs no API key.
- **Privacy is a selling point.** Never store raw messages, screenshots, or phone numbers in
  Firestore. Store analysis results only (see BLUEPRINT section 7).

## Commands
- Run on phone: `flutter run` (Android, over USB or wireless debugging)
- Check code: `flutter analyze`
- Release build: `flutter build apk --release`

## Environment
- Windows laptop and an Android phone for testing.
- The project must **not** be inside a OneDrive folder, because Gradle builds break there.
