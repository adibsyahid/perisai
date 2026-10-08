import 'package:flutter/material.dart';

import '../l10n/app_localizations.dart';
import '../theme/app_colors.dart';

/// Temporary body for tabs we have not built yet.
class ComingSoon extends StatelessWidget {
  const ComingSoon({super.key, required this.icon, this.onDark = false});

  final IconData icon;

  /// True on dark screens (Radar), so the text stays readable.
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final color = onDark ? Colors.white70 : AppColors.muted;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 72, color: onDark ? Colors.white70 : AppColors.perisaiBlue),
            const SizedBox(height: 16),
            Text(
              AppLocalizations.of(context).comingSoon,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: color),
            ),
          ],
        ),
      ),
    );
  }
}
