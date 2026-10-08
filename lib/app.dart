import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/l10n/app_localizations.dart';
import 'core/theme/app_theme.dart';
import 'features/settings/data/settings_controller.dart';

/// Root widget. Theme, language and routing are wired here.
class PerisaiApp extends StatelessWidget {
  const PerisaiApp({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsController>();

    return MaterialApp(
      onGenerateTitle: (context) => AppLocalizations.of(context).appTitle,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      locale: settings.locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: Builder(
        builder: (context) => Scaffold(
          body: Center(child: Text(AppLocalizations.of(context).appTitle)),
        ),
      ),
    );
  }
}
