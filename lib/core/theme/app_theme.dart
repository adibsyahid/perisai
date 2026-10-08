import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// The PERISAI look in one place (BLUEPRINT section 4).
/// Text and touch targets are bigger than Material defaults because many users are elderly.
class AppTheme {
  AppTheme._();

  static const double cardRadius = 20;
  static const double buttonRadius = 16;
  static const double minTouchTarget = 56;

  // Only the sizes we change. Flutter fills in the rest from Material defaults.
  static const _sizes = TextTheme(
    headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w700), // verdict headline
    headlineMedium: TextStyle(fontSize: 26, fontWeight: FontWeight.w700),
    titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
    titleMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
    bodyLarge: TextStyle(fontSize: 18),
    bodyMedium: TextStyle(fontSize: 18),
    bodySmall: TextStyle(fontSize: 16),
    labelLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
    labelMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
  );

  static ThemeData light() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.perisaiBlue,
      primary: AppColors.perisaiBlue,
      onPrimary: Colors.white,
      secondary: AppColors.navy,
      error: AppColors.danger,
      surface: AppColors.surface,
      onSurface: AppColors.navy,
      onSurfaceVariant: AppColors.muted,
    );

    final textTheme = GoogleFonts.plusJakartaSansTextTheme(_sizes)
        .apply(bodyColor: AppColors.navy, displayColor: AppColors.navy);

    final buttonStyle = ButtonStyle(
      minimumSize: const WidgetStatePropertyAll(Size(minTouchTarget, minTouchTarget)),
      padding: const WidgetStatePropertyAll(EdgeInsets.symmetric(horizontal: 24)),
      textStyle: WidgetStatePropertyAll(textTheme.labelLarge),
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(borderRadius: BorderRadius.circular(buttonRadius)),
      ),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.surface,
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.navy,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: textTheme.titleLarge,
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 2,
        shadowColor: AppColors.navy.withValues(alpha: 0.08),
        surfaceTintColor: Colors.transparent,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(cardRadius)),
      ),
      filledButtonTheme: FilledButtonThemeData(style: buttonStyle),
      elevatedButtonTheme: ElevatedButtonThemeData(style: buttonStyle),
      outlinedButtonTheme: OutlinedButtonThemeData(style: buttonStyle),
      textButtonTheme: TextButtonThemeData(style: buttonStyle),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.card,
        indicatorColor: AppColors.perisaiBlue.withValues(alpha: 0.12),
        height: 80,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            size: 28,
            color: states.contains(WidgetState.selected)
                ? AppColors.perisaiBlue
                : AppColors.muted,
          ),
        ),
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => textTheme.labelMedium?.copyWith(
            color: states.contains(WidgetState.selected)
                ? AppColors.perisaiBlue
                : AppColors.muted,
          ),
        ),
      ),
    );
  }
}
