import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/user_model.dart';
import '../services/pin_auth_service.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'site_visitor/site_visitor_tab_scaffold.dart';
import 'project_manager/pm_tab_scaffold.dart';
import 'admin/admin_tab_scaffold.dart';

class PinScreen extends StatefulWidget {
  final UserModel user;

  const PinScreen({super.key, required this.user});

  @override
  State<PinScreen> createState() => _PinScreenState();
}

class _PinScreenState extends State<PinScreen> {
  String _pin = '';
  String? _error;

  void _onKeyPress(String digit) {
    if (_pin.length < 4) {
      setState(() {
        _pin += digit;
        _error = null;
      });
      if (_pin.length == 4) {
        _verify();
      }
    }
  }

  void _onBackspace() {
    if (_pin.isNotEmpty) {
      setState(() {
        _pin = _pin.substring(0, _pin.length - 1);
        _error = null;
      });
    }
  }

  Future<void> _verify() async {
    final ok = await PinAuthService.verifyPin(_pin);
    if (!mounted) return;

    if (ok) {
      Widget dest;
      switch (widget.user.role.toLowerCase()) {
        case 'admin':
          dest = AdminTabScaffold(user: widget.user);
          break;
        case 'projectmanager':
        case 'sales':
        case 'accounts':
        case 'purchase':
        case 'workshop':
        case 'design':
          dest = PmTabScaffold(user: widget.user);
          break;
        case 'sitevisitor':
        default:
          dest = SiteVisitorTabScaffold(user: widget.user);
          break;
      }
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => dest));
    } else {
      setState(() {
        _pin = '';
        _error = 'Incorrect Security PIN. Try again.';
      });
    }
  }

  void _handleSwitchAccount() async {
    await ApiService.clearCurrentUser();
    if (!mounted) return;
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            children: [
              const Spacer(),

              // Logo & Branding
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Image.asset(
                  'assets/logos/iroofing_wordmark_white_small.png',
                  height: 44,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => const Text(
                    'I ROOFING',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 2),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Welcome Back, ${widget.user.name}',
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              const Text(
                'Enter your 4-digit PIN to unlock mobile session',
                style: TextStyle(color: Colors.white60, fontSize: 12.5),
              ),

              const SizedBox(height: 28),

              // PIN Indicator Dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) {
                  final isFilled = index < _pin.length;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 10),
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isFilled ? AppColors.accentGold : Colors.white24,
                      border: Border.all(color: isFilled ? AppColors.accentGold : Colors.white54, width: 1.5),
                    ),
                  );
                }),
              ),

              if (_error != null) ...[
                const SizedBox(height: 14),
                Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12.5, fontWeight: FontWeight.w600)),
              ],

              const Spacer(),

              // Custom Keypad
              _buildKeypad(),

              const SizedBox(height: 16),

              TextButton(
                onPressed: _handleSwitchAccount,
                child: const Text('Switch Account or Sign In with Password', style: TextStyle(color: Colors.white70, fontSize: 12)),
              ),

              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKeypad() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: ['1', '2', '3'].map((d) => _buildKey(d)).toList(),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: ['4', '5', '6'].map((d) => _buildKey(d)).toList(),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: ['7', '8', '9'].map((d) => _buildKey(d)).toList(),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            const SizedBox(width: 64, height: 64),
            _buildKey('0'),
            IconButton(
              iconSize: 28,
              icon: const Icon(Icons.backspace_outlined, color: Colors.white70),
              onPressed: _onBackspace,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKey(String digit) {
    return InkWell(
      onTap: () => _onKeyPress(digit),
      borderRadius: BorderRadius.circular(32),
      child: Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withValues(alpha: 0.1),
        ),
        child: Center(
          child: Text(
            digit,
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }
}
