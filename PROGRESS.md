# PERISAI progress

_Last updated: 8 Oct 2026 (end of P0 session)_

| Phase | Status |
|---|---|
| P0 Setup | Code done. Waiting for Ahmad to test on his phone. |
| P1 Firebase + Imbas | Not started |
| P2 Share | Not started |
| P3 Keluarga | Not started |
| P4 Radar | Not started |
| P5 Polish | Not started |
| P6 Evaluate + release | Not started |

## Done
### P0 Setup
- `flutter create --project-name perisai --org com.kpmb --platforms android .`
  (Android only, as BLUEPRINT section 3 says). Package: `com.kpmb.perisai`. Git repo on branch `main`.
- Packages: `provider`, `go_router`, `google_fonts`, `intl`, `flutter_localizations`.
  The other BLUEPRINT packages get added in the phase that first uses them, which keeps each step small.
- Theme in `lib/core/theme/`: BLUEPRINT colours, Plus Jakarta Sans, 18sp body, 32sp verdict headline,
  56dp minimum buttons, 20dp card radius, 16dp button radius.
- l10n in `lib/core/l10n/`: `app_ms.arb` is the template (BM default), `app_en.arb` is English.
  Generated `app_localizations*.dart` files are committed. After editing an ARB file, run `flutter gen-l10n`
  (`flutter run` also does it).
- Routing in `lib/core/router/`: `StatefulShellRoute` with 4 tabs: `/utama`, `/keluarga`, `/radar`, `/tetapan`.
  Placeholder screens live in `lib/features/<scan|family|radar|settings>/ui/`. Radar already uses the dark background.
- `SettingsController` (provider + ChangeNotifier) holds the language. Default is BM even if the phone is in English.
  The Tetapan tab has a BM/EN switch so both languages can be tested.
- Android: app label `PERISAI`, plus the `INTERNET` permission (needed by release builds).

## Next: P1 Firebase + Imbas
1. **Ahmad first:** create the Firebase project on the Spark plan. Claude gives click-by-click steps at the start of the P1 session.
2. Then `flutterfire configure`, Anonymous Auth, Firestore (`asia-southeast1`), Firebase AI Logic.
3. Then the Utama screen: input tiles, preprocessing, link heuristics, Gemini call + schema, Scanning, Result, TTS, local history.

## Known issues / notes
- The language choice is not saved yet, so it resets to BM after a restart. Save it with `shared_preferences` once we add that package in P1.
- `google_fonts` downloads Plus Jakarta Sans on first launch (needs internet once, then it is cached).
  If we want fully offline fonts, bundle the TTF files in P5.
- All Android SDK licenses were accepted on 8 Oct. `flutter doctor` now shows no issues.
- Flutter 3.41.6 is installed and a newer stable exists. We stay on 3.41.6 unless something needs the upgrade.
- On Windows, git prints "LF will be replaced by CRLF" warnings. They are harmless.

## What Ahmad must do now
1. Connect the phone (USB or wireless debugging) and run `flutter run`. Check the P0 test list:
   - The app opens with the name **PERISAI** and a light grey-blue background.
   - The bottom bar shows 4 tabs: **Utama · Keluarga · Radar · Tetapan**. Each tab opens.
   - Radar has a dark navy background.
   - Tetapan → choose **English**: the tab names change to Home · Family · Radar · Settings. Choose **Bahasa Melayu** to switch back.
   - The text looks big and easy to read, and there is no yellow/black overflow stripe.
