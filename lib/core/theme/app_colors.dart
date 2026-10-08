import 'package:flutter/material.dart';

/// PERISAI colours (BLUEPRINT section 4).
/// Widgets use these names so the whole app can be re-coloured from one file.
class AppColors {
  AppColors._();

  static const navy = Color(0xFF0B1B3F);
  static const perisaiBlue = Color(0xFF1D4ED8);
  static const surface = Color(0xFFF6F7FB);
  static const card = Color(0xFFFFFFFF);

  // Verdict colours. Always pair them with an icon and a word, never colour alone.
  static const danger = Color(0xFFDC2626);
  static const warning = Color(0xFFF59E0B);
  static const safe = Color(0xFF16A34A);

  static const radarBackground = Color(0xFF07122B);

  // Secondary text. Still passes WCAG AA contrast on both surface and card.
  static const muted = Color(0xFF5B6478);
}
