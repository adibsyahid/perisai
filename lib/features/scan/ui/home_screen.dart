import 'package:flutter/material.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/widgets/coming_soon.dart';

/// Utama tab. The Imbas Sekarang button and input tiles come in P1.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(AppLocalizations.of(context).appTitle)),
      body: const ComingSoon(icon: Icons.shield_outlined),
    );
  }
}
