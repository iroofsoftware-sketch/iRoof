import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'constants/app_colors.dart';
import 'models/user_model.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/admin/admin_home.dart';
import 'screens/project_manager/pm_home.dart';
import 'screens/site_visitor/site_visitor_home.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Make system navigation bar and status bar transparent & crisp
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppColors.primaryDark,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Instantly start the Flutter app without blocking on I/O
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
        return AdminHome(user: user);
      case 'projectmanager':
        return PmHome(user: user);
      case 'sitevisitor':
      default:
        return SiteVisitorHome(user: user);
    }
  }
}

/// Instant bootstrapper that draws the first frame in < 50ms,
/// eliminating any splash-screen freeze or ANR.
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
    try {
      user = await ApiService.getCurrentUser().timeout(
        const Duration(milliseconds: 600),
        onTimeout: () => null,
      );
    } catch (_) {
      user = null;
    }

    if (!mounted) return;

    if (user != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => IRoofMobileApp._getDestination(user!)),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AppColors.primaryDark,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'I ROOFING',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.w800,
                letterSpacing: 3,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'ARCHITECTURAL ROOFING SYSTEMS',
              style: TextStyle(
                color: AppColors.accentGold,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 2,
              ),
            ),
            SizedBox(height: 32),
            SizedBox(
              width: 28,
              height: 28,
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
