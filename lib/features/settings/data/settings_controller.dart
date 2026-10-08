import 'package:flutter/material.dart';

/// App-wide user settings. Widgets read it with `context.watch<SettingsController>()`.
class SettingsController extends ChangeNotifier {
  // Bahasa Melayu by default, even when the phone itself is set to English.
  Locale _locale = const Locale('ms');

  Locale get locale => _locale;

  void setLocale(Locale locale) {
    if (locale == _locale) return;
    _locale = locale;
    notifyListeners();
  }
}
