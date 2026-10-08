import 'package:flutter/material.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/coming_soon.dart';

/// Radar tab: the dark "command centre". Map, chart and live feed come in P4.
class RadarScreen extends StatelessWidget {
  const RadarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.radarBackground,
      appBar: AppBar(
        backgroundColor: AppColors.radarBackground,
        foregroundColor: Colors.white,
        title: Text(AppLocalizations.of(context).tabRadar),
      ),
      body: const ComingSoon(icon: Icons.radar, onDark: true),
    );
  }
}
