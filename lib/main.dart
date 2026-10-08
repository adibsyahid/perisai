import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'features/settings/data/settings_controller.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => SettingsController(),
      child: const PerisaiApp(),
    ),
  );
}
