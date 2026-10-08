import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/theme/app_colors.dart';
import '../data/settings_controller.dart';

/// Tetapan tab. Only the language switch for now, so we can test BM and EN.
/// Large text, voice and the About section come later.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final settings = context.watch<SettingsController>();
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.tabSettings)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(l10n.settingsLanguage, style: textTheme.titleMedium),
          const SizedBox(height: 8),
          Card(
            child: RadioGroup<String>(
              groupValue: settings.locale.languageCode,
              onChanged: (code) {
                if (code != null) settings.setLocale(Locale(code));
              },
              child: Column(
                children: [
                  RadioListTile(value: 'ms', title: Text(l10n.languageMalay)),
                  RadioListTile(value: 'en', title: Text(l10n.languageEnglish)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          Text(
            l10n.comingSoon,
            textAlign: TextAlign.center,
            style: textTheme.bodyLarge?.copyWith(color: AppColors.muted),
          ),
        ],
      ),
    );
  }
}
