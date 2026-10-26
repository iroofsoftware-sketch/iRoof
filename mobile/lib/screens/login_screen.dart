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
  String _activeRoleKey = 'site';
  String _activeRoleLabel = 'Site Visitor';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _quickFillRole(String roleKey) {
    setState(() {
      _activeRoleKey = roleKey;
      switch (roleKey) {
        case 'admin':
          _emailController.text = 'admin@iroofing.com';
          _passwordController.text = 'Admin@123';
          _activeRoleLabel = 'System Admin';
          break;
        case 'sales':
          _emailController.text = 'sales@iroofing.com';
          _passwordController.text = 'Sales@123';
          _activeRoleLabel = 'Sales Lead';
          break;
        case 'pm':
          _emailController.text = 'pm@iroofing.com';
          _passwordController.text = 'Pm@123';
          _activeRoleLabel = 'Project Manager';
          break;
        case 'site':
        default:
          _emailController.text = 'sitevisitor@iroofing.com';
          _passwordController.text = 'Site@123';
          _activeRoleLabel = 'Site Visitor';
          break;
      }
    });
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty) {
      _showFeedbackSnackBar('Please enter your work email');
      return;
    }
    if (password.isEmpty) {
      _showFeedbackSnackBar('Please enter your password');
      return;
    }

    setState(() => _loading = true);

    try {
      final user = await ApiService.login(email, password);
      if (!mounted) return;
      _navigateToHome(user);
    } catch (e) {
      if (!mounted) return;
      _showFeedbackSnackBar('Authentication error: ${e.toString()}');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showFeedbackSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        backgroundColor: AppColors.primaryNavy,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _navigateToHome(UserModel user) {
    Widget destination;
    switch (user.role.toLowerCase()) {
      case 'admin':
      case 'sales':
        destination = AdminTabScaffold(user: user);
        break;
      case 'projectmanager':
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
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF040E1E),
              Color(0xFF071933),
              Color(0xFF0B2E59),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // ── TOP HEADER / SETTINGS BAR ──
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: AppColors.successGreen,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'ENTERPRISE SUITE v2.0',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      tooltip: 'Server Gateway Settings',
                      icon: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                        ),
                        child: const Icon(Icons.tune_outlined, color: AppColors.accentGold, size: 18),
                      ),
                      onPressed: () => ServerConfigDialog.show(context),
                    ),
                  ],
                ),
              ),

              // ── SCROLLABLE BODY ──
              Expanded(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 420),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // ── LOGO & BRANDING ──
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
                            ),
                            child: Image.asset(
                              'assets/logos/iroofing_wordmark_white_small.png',
                              height: 44,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => const Text(
                                'I ROOFING',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 3,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'ARCHITECTURAL ROOFING SYSTEMS',
                            style: TextStyle(
                              color: AppColors.accentGold,
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2.2,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Field Operations & Production Management Suite',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white60,
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                            ),
                          ),

                          const SizedBox(height: 24),

                          // ── CARD LOGIN FORM ──
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x33000000),
                                  blurRadius: 30,
                                  offset: Offset(0, 12),
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Card Title & Badge
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: const [
                                        Text(
                                          'Authorized Sign In',
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w800,
                                            color: AppColors.textPrimary,
                                            letterSpacing: -0.3,
                                          ),
                                        ),
                                        SizedBox(height: 2),
                                        Text(
                                          'Access your enterprise workspace',
                                          style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryNavySurface,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: AppColors.primaryNavy.withValues(alpha: 0.15)),
                                      ),
                                      child: Text(
                                        _activeRoleLabel.toUpperCase(),
                                        style: const TextStyle(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.primaryNavy,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),

                                // Email Input
                                TextField(
                                  controller: _emailController,
                                  keyboardType: TextInputType.emailAddress,
                                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                  decoration: InputDecoration(
                                    labelText: 'Work Email Address',
                                    prefixIcon: const Icon(Icons.mail_outline_rounded, color: AppColors.primaryNavy, size: 20),
                                    filled: true,
                                    fillColor: AppColors.background,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: AppColors.border),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: AppColors.border),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: AppColors.primaryNavy, width: 1.6),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 14),

                                // Password Input
                                TextField(
                                  controller: _passwordController,
                                  obscureText: _obscurePassword,
                                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                  decoration: InputDecoration(
                                    labelText: 'Password',
                                    prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.primaryNavy, size: 20),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                        color: AppColors.textMuted,
                                        size: 20,
                                      ),
                                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                    ),
                                    filled: true,
                                    fillColor: AppColors.background,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: AppColors.border),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: AppColors.border),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: AppColors.primaryNavy, width: 1.6),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 20),

                                // Sign In Button
                                Container(
                                  height: 48,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [AppColors.primaryNavy, Color(0xFF133E75)],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.primaryNavy.withValues(alpha: 0.3),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: ElevatedButton(
                                    onPressed: _loading ? null : _handleLogin,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.transparent,
                                      shadowColor: Colors.transparent,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    child: _loading
                                        ? const SizedBox(
                                            height: 20,
                                            width: 20,
                                            child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                                          )
                                        : Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: const [
                                              Text(
                                                'Sign In to Workspace',
                                                style: TextStyle(
                                                  fontSize: 14.5,
                                                  fontWeight: FontWeight.w700,
                                                  color: Colors.white,
                                                  letterSpacing: 0.2,
                                                ),
                                              ),
                                              SizedBox(width: 8),
                                              Icon(Icons.arrow_forward_rounded, size: 18, color: Colors.white),
                                            ],
                                          ),
                                  ),
                                ),

                                const SizedBox(height: 22),
                                const Divider(color: AppColors.borderLight, height: 1),
                                const SizedBox(height: 16),

                                // ── 2x2 BALANCED QUICK ACCOUNT SWITCHER ──
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: const [
                                    Text(
                                      'Quick Switch Role:',
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    Text(
                                      'Auto-fills credentials',
                                      style: TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),

                                // 2x2 Grid of Roles
                                Row(
                                  children: [
                                    Expanded(
                                      child: _buildRoleCard(
                                        roleKey: 'site',
                                        title: 'Site Visitor',
                                        subtitle: 'Field Inspector',
                                        icon: Icons.location_on_outlined,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: _buildRoleCard(
                                        roleKey: 'pm',
                                        title: 'Project Mgr',
                                        subtitle: 'Work Orders & Operations',
                                        icon: Icons.engineering_outlined,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  children: [
                                    Expanded(
                                      child: _buildRoleCard(
                                        roleKey: 'sales',
                                        title: 'Sales Lead',
                                        subtitle: 'Estimates & Leads',
                                        icon: Icons.point_of_sale_outlined,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: _buildRoleCard(
                                        roleKey: 'admin',
                                        title: 'System Admin',
                                        subtitle: 'Executive Console',
                                        icon: Icons.admin_panel_settings_outlined,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 24),

                          // ── ENTERPRISE FOOTER ──
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.shield_outlined, size: 13, color: Colors.white54),
                              SizedBox(width: 6),
                              Text(
                                'Protected 256-Bit TLS · iRoofing Enterprises © 2026',
                                style: TextStyle(
                                  color: Colors.white54,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleCard({
    required String roleKey,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _activeRoleKey == roleKey;

    return InkWell(
      onTap: () => _quickFillRole(roleKey),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryNavy : AppColors.background,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.accentGold : AppColors.border,
            width: isSelected ? 1.6 : 1.0,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primaryNavy.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.accentGold.withValues(alpha: 0.25)
                    : AppColors.primaryNavy.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 15,
                color: isSelected ? AppColors.accentGold : AppColors.primaryNavy,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.w500,
                      color: isSelected ? Colors.white70 : AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
