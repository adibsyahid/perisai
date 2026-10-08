import 'package:flutter/material.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/widgets/coming_soon.dart';

/// Keluarga tab. Pairing and alerts come in P3.
class FamilyScreen extends StatelessWidget {
  const FamilyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(AppLocalizations.of(context).tabFamily)),
      body: const ComingSoon(icon: Icons.people_outline),
    );
  }
}
