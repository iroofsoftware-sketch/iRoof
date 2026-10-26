import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import 'admin/admin_tab_scaffold.dart';
import 'project_manager/pm_tab_scaffold.dart';
import 'site_visitor/site_visitor_tab_scaffold.dart';
import 'common/server_config_dialog.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Pre-filled with Site Visitor seed credentials for rapid field access
  final _emailController = TextEditingController(text: 'sitevisitor@iroofing.com');
  final _passwordController = TextEditingController(text: 'Site@123');
  bool _loading = false;
  bool _obscurePassword = true;
  String _activeRoleLabel = 'Site Visitor';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _quickFillRole(String role) {
    setState(() {
      if (role == 'admin') {
        _emailController.text = 'admin@iroofing.com';
        _passwordController.text = 'Admin@123';
        _activeRoleLabel = 'Admin';
      } else if (role == 'pm') {
        _emailController.text = 'pm@iroofing.com';
        _passwordController.text = 'Pm@123';
        _activeRoleLabel = 'Project Manager';
      } else {
        _emailController.text = 'sitevisitor@iroofing.com';
        _passwordController.text = 'Site@123';
        _activeRoleLabel = 'Site Visitor';
      }
    });
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      final user = await ApiService.login(email, password);
      if (!mounted) return;
      _navigateToHome(user);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login notice: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _navigateToHome(UserModel user) {
    Widget destination;
    switch (user.role.toLowerCase()) {
      case 'admin':
        destination = AdminTabScaffold(user: user);
        break;
      case 'projectmanager':
      case 'sales':
      case 'accounts':
      case 'purchase':
      case 'workshop':
      case 'design':
        destination = PmTabScaffold(user: user);
        break;
      case 'sitevisitor':
      default:
        destination = SiteVisitorTabScaffold(user: user);
        break;
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => destination),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'iRoofing Enterprise',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white70),
        ),
        actions: [
          IconButton(
            tooltip: 'Server Gateway Settings',
            icon: const Icon(Icons.settings_outlined, color: AppColors.accentGold),
            onPressed: () => ServerConfigDialog.show(context),
          ),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // ── LOGO & BRANDING ──
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Image.asset(
                    'assets/logos/iroofing_wordmark_white_small.png',
                    height: 48,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => const Text(
                      'I ROOFING',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'ARCHITECTURAL ROOFING SYSTEMS',
                  style: TextStyle(
                    color: AppColors.accentGold,
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 2.2,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Field Consultation, Engineering & PM Operations',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white54, fontSize: 11.5),
                ),

                const SizedBox(height: 28),

                // ── CARD LOGIN FORM ──
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black38,
                        blurRadius: 20,
                        offset: Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Authorized Sign In',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.accentGold.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              _activeRoleLabel.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primaryNavy,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Site Visitors · Project Managers · Admins',
                        style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 18),

                      // Email Field
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: 'Work Email',
                          prefixIcon: const Icon(Icons.email_outlined, color: AppColors.primaryNavy, size: 20),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Password Field
                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outline, color: AppColors.primaryNavy, size: 20),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off : Icons.visibility,
                              color: Colors.grey,
                              size: 20,
                            ),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Sign In Button
                      ElevatedButton(
                        onPressed: _loading ? null : () => _handleLogin(),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryNavy,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 2,
                        ),
                        child: _loading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text(
                                'Sign In to Workspace',
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                              ),
                      ),

                      const SizedBox(height: 18),
                      const Divider(height: 1),
                      const SizedBox(height: 12),

                      // Quick Account Switcher
                      const Text(
                        'Quick Role Switcher (Auto-fills credentials):',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _quickFillRole('site'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                side: BorderSide(
                                  color: _activeRoleLabel == 'Site Visitor' ? AppColors.accentGold : AppColors.border,
                                  width: _activeRoleLabel == 'Site Visitor' ? 1.8 : 1.0,
                                ),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              child: const Text('Site Visitor', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _quickFillRole('pm'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                side: BorderSide(
                                  color: _activeRoleLabel == 'Project Manager' ? AppColors.accentGold : AppColors.border,
                                  width: _activeRoleLabel == 'Project Manager' ? 1.8 : 1.0,
                                ),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              child: const Text('PM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _quickFillRole('admin'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                side: BorderSide(
                                  color: _activeRoleLabel == 'Admin' ? AppColors.accentGold : AppColors.border,
                                  width: _activeRoleLabel == 'Admin' ? 1.8 : 1.0,
                                ),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              child: const Text('Admin', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // ── BRAND FOOTER (AUXZON) ──
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Text(
                      'I Roofing Enterprises',
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                    Text(
                      ' · ',
                      style: TextStyle(color: Colors.white30, fontSize: 12),
                    ),
                    Text(
                      'Powered by Auxzon',
                      style: TextStyle(
                        color: AppColors.accentGold,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'auxzons.com',
                  style: TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
