import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'constants/app_colors.dart';
import 'models/user_model.dart';
import 'services/api_service.dart';
import 'services/pin_auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/pin_screen.dart';
import 'screens/admin/admin_tab_scaffold.dart';
import 'screens/project_manager/pm_tab_scaffold.dart';
import 'screens/site_visitor/site_visitor_tab_scaffold.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppColors.primaryDark,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const IRoofMobileApp());
}

class IRoofMobileApp extends StatelessWidget {
  final UserModel? initialUser;

  const IRoofMobileApp({super.key, this.initialUser});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'iRoofing Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryNavy,
          primary: AppColors.primaryNavy,
          secondary: AppColors.accentGold,
          surface: AppColors.background,
        ),
        scaffoldBackgroundColor: AppColors.background,
        fontFamily: 'Roboto',
      ),
      home: initialUser != null
          ? _getDestination(initialUser!)
          : const AppBootstrapper(),
    );
  }

  static Widget _getDestination(UserModel user) {
    switch (user.role.toLowerCase()) {
      case 'admin':
        return AdminTabScaffold(user: user);
      case 'projectmanager':
        return PmTabScaffold(user: user);
      case 'sitevisitor':
      default:
        return SiteVisitorTabScaffold(user: user);
    }
  }
}

class AppBootstrapper extends StatefulWidget {
  const AppBootstrapper({super.key});

  @override
  State<AppBootstrapper> createState() => _AppBootstrapperState();
}

class _AppBootstrapperState extends State<AppBootstrapper> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    UserModel? user;
    bool pinEnabled = false;

    try {
      user = await ApiService.getCurrentUser().timeout(
        const Duration(milliseconds: 700),
        onTimeout: () => null,
      );
      if (user != null) {
        pinEnabled = await PinAuthService.isPinEnabled();
      }
    } catch (_) {
      user = null;
    }

    if (!mounted) return;

    if (user != null) {
      if (pinEnabled) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => PinScreen(user: user!)),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => IRoofMobileApp._getDestination(user!)),
        );
      }
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryDark,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Image.asset(
                'assets/logos/iroofing_wordmark_white_small.png',
                height: 54,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Text(
                  'I ROOFING',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 3,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'ARCHITECTURAL ROOFING SYSTEMS',
              style: TextStyle(
                color: AppColors.accentGold,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 2.2,
              ),
            ),
            const SizedBox(height: 36),
            const SizedBox(
              width: 26,
              height: 26,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.accentGold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
