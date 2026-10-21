import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'constants/app_colors.dart';
import 'models/user_model.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/admin/admin_home.dart';
import 'screens/project_manager/pm_home.dart';
import 'screens/site_visitor/site_visitor_home.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  final user = await ApiService.getCurrentUser();
  runApp(IRoofMobileApp(initialUser: user));
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
      home: _getHome(initialUser),
    );
  }

  Widget _getHome(UserModel? user) {
    if (user == null) {
      return const LoginScreen();
    }
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
