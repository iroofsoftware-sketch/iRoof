import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import 'admin/admin_home.dart';
import 'project_manager/pm_home.dart';
import 'site_visitor/site_visitor_home.dart';
import 'common/server_config_dialog.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'site@iroofing.in');
  final _passwordController = TextEditingController(text: 'admin123');
  bool _loading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _quickFillRole(String role) {
    if (role == 'admin') {
      _emailController.text = 'admin@iroofing.in';
      _passwordController.text = 'admin123';
    } else if (role == 'pm') {
      _emailController.text = 'pm@iroofing.in';
      _passwordController.text = 'admin123';
    } else {
      _emailController.text = 'site@iroofing.in';
      _passwordController.text = 'admin123';
    }
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email and password')),
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
        SnackBar(content: Text('Login failed: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _navigateToHome(UserModel user) {
    Widget destination;
    switch (user.role.toLowerCase()) {
      case 'admin':
        destination = AdminHome(user: user);
        break;
      case 'projectmanager':
        destination = PmHome(user: user);
        break;
      case 'sitevisitor':
      default:
        destination = SiteVisitorHome(user: user);
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
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Colors.white70),
            tooltip: 'Server Connection Settings',
            onPressed: () => ServerConfigDialog.show(context),
          ),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // ── LOGO & BRANDING ──
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Image.asset(
                    'assets/logos/iroofing_wordmark_white_small.png',
                    height: 46,
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
                  'Enterprise Mobile Suite',
                  style: TextStyle(
                    color: AppColors.accentGold,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Field Consultation, Engineering & PM Operations',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white54, fontSize: 11.5),
                ),

                const SizedBox(height: 32),

                // ── CARD LOGIN FORM ──
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 20,
                        offset: Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Authorized Sign In',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Site Visitors · Project Managers · Admins',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 20),

                      // Email Field
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: 'Work Email',
                          prefixIcon: const Icon(Icons.email_outlined, color: AppColors.primaryNavy),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Password Field
                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outline, color: AppColors.primaryNavy),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off : Icons.visibility,
                              color: Colors.grey,
                            ),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 22),

                      // Sign In Button
                      ElevatedButton(
                        onPressed: _loading ? null : _handleLogin,
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
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                              ),
                      ),

                      const SizedBox(height: 20),
                      const Divider(height: 1),
                      const SizedBox(height: 14),

                      // Quick Account Switcher
                      const Text(
                        'Select Test Account:',
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
                                side: const BorderSide(color: AppColors.accentGold),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              child: const Text('Site Visitor', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryNavy)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _quickFillRole('pm'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                side: const BorderSide(color: AppColors.border),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              child: const Text('PM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryNavy)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _quickFillRole('admin'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                side: const BorderSide(color: AppColors.border),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              child: const Text('Admin', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryNavy)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 30),

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
