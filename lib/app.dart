import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';

/// Root widget. Theme, language and routing are wired here.
class PerisaiApp extends StatelessWidget {
  const PerisaiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PERISAI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: const Scaffold(body: Center(child: Text('PERISAI'))),
    );
  }
}
