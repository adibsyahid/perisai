import 'package:go_router/go_router.dart';

import '../../features/family/ui/family_screen.dart';
import '../../features/radar/ui/radar_screen.dart';
import '../../features/scan/ui/home_screen.dart';
import '../../features/settings/ui/settings_screen.dart';
import 'app_shell.dart';

/// Every route in the app, in one list.
/// Created once (not inside build) so switching language does not reset navigation.
final appRouter = GoRouter(
  initialLocation: '/utama',
  routes: [
    // indexedStack keeps each tab alive, so a tab remembers its scroll position.
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) =>
          AppShell(navigationShell: navigationShell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/utama', builder: (context, state) => const HomeScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/keluarga', builder: (context, state) => const FamilyScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/radar', builder: (context, state) => const RadarScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/tetapan', builder: (context, state) => const SettingsScreen()),
        ]),
      ],
    ),
  ],
);
