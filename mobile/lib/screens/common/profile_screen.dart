import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../../services/pin_auth_service.dart';
import 'server_config_dialog.dart';
import '../login_screen.dart';

class ProfileScreen extends StatefulWidget {
  final UserModel user;
  final Function(UserModel updatedUser)? onUserUpdated;

  const ProfileScreen({super.key, required this.user, this.onUserUpdated});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late UserModel _currentUser;
  bool _pinEnabled = false;

  @override
  void initState() {
    super.initState();
    _currentUser = widget.user;
    _checkPinStatus();
  }

  Future<void> _checkPinStatus() async {
    final enabled = await PinAuthService.isPinEnabled();
    if (mounted) setState(() => _pinEnabled = enabled);
  }

  void _showEditProfileDialog() {
    final nameCtrl = TextEditingController(text: _currentUser.name);
    final emailCtrl = TextEditingController(text: _currentUser.email);
    final phoneCtrl = TextEditingController(text: _currentUser.phone ?? '');
    final designationCtrl = TextEditingController(text: _currentUser.designation ?? '');
    bool saving = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (innerCtx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.edit_note, color: AppColors.primaryNavy),
              const SizedBox(width: 8),
              const Text('Edit Profile Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.person_outline),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Official Email',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone / Mobile',
                    prefixIcon: Icon(Icons.phone_outlined),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: designationCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Designation / Branch',
                    prefixIcon: Icon(Icons.badge_outlined),
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: saving ? null : () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryNavy,
                foregroundColor: Colors.white,
              ),
              onPressed: saving
                  ? null
                  : () async {
                      if (nameCtrl.text.trim().isEmpty || emailCtrl.text.trim().isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Name and Email are required')),
                        );
                        return;
                      }

                      setDialogState(() => saving = true);
                      try {
                        final updated = await ApiService.updateProfile(
                          name: nameCtrl.text.trim(),
                          email: emailCtrl.text.trim(),
                          phone: phoneCtrl.text.trim(),
                          designation: designationCtrl.text.trim(),
                        );

                        if (ctx.mounted) {
                          Navigator.pop(ctx);
                        }
                        if (mounted) {
                          setState(() => _currentUser = updated);
                          widget.onUserUpdated?.call(updated);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Profile updated successfully!')),
                          );
                        }
                      } catch (e) {
                        if (ctx.mounted) {
                          setDialogState(() => saving = false);
                        }
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: ${e.toString()}')),
                          );
                        }
                      }
                    },
              child: saving
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }

  void _showChangePasswordDialog() {
    final currentCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();
    bool saving = false;
    bool obscure = true;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (innerCtx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.lock_reset, color: AppColors.primaryNavy),
              const SizedBox(width: 8),
              const Text('Change Password', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: currentCtrl,
                  obscureText: obscure,
                  decoration: InputDecoration(
                    labelText: 'Current Password',
                    prefixIcon: const Icon(Icons.lock_outline),
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: Icon(obscure ? Icons.visibility : Icons.visibility_off),
                      onPressed: () => setDialogState(() => obscure = !obscure),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newCtrl,
                  obscureText: obscure,
                  decoration: const InputDecoration(
                    labelText: 'New Password (min 6 chars)',
                    prefixIcon: Icon(Icons.key),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmCtrl,
                  obscureText: obscure,
                  decoration: const InputDecoration(
                    labelText: 'Confirm New Password',
                    prefixIcon: Icon(Icons.key),
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: saving ? null : () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryNavy,
                foregroundColor: Colors.white,
              ),
              onPressed: saving
                  ? null
                  : () async {
                      if (currentCtrl.text.isEmpty || newCtrl.text.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please fill all password fields')),
                        );
                        return;
                      }
                      if (newCtrl.text.length < 6) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('New password must be at least 6 characters')),
                        );
                        return;
                      }
                      if (newCtrl.text != confirmCtrl.text) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('New password and confirm password do not match')),
                        );
                        return;
                      }

                      setDialogState(() => saving = true);
                      try {
                        await ApiService.changePassword(
                          currentPassword: currentCtrl.text,
                          newPassword: newCtrl.text,
                        );

                        if (ctx.mounted) {
                          Navigator.pop(ctx);
                        }
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Password changed successfully!')),
                          );
                        }
                      } catch (e) {
                        if (ctx.mounted) {
                          setDialogState(() => saving = false);
                        }
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: ${e.toString()}')),
                          );
                        }
                      }
                    },
              child: saving
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Update Password'),
            ),
          ],
        ),
      ),
    );
  }

  void _showPinSetupDialog() async {
    final pinController = TextEditingController();
    final isEnabled = await PinAuthService.isPinEnabled();

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.security, color: AppColors.primaryNavy),
            const SizedBox(width: 8),
            Text(isEnabled ? 'Security PIN Active' : 'Set Quick 4-Digit PIN', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isEnabled
                  ? 'Quick unlock PIN is currently enabled on this device. You can reset or disable it below.'
                  : 'Enter a 4-digit PIN for instant access on construction sites without retyping passwords.',
              style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              obscureText: true,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 22, letterSpacing: 8, fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                hintText: '••••',
                counterText: '',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          if (isEnabled)
            TextButton(
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              onPressed: () async {
                await PinAuthService.disablePin();
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                }
                if (!mounted) return;
                _checkPinStatus();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Quick PIN disabled')),
                );
              },
              child: const Text('Disable PIN'),
            ),
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryNavy,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              final pin = pinController.text.trim();
              if (pin.length != 4) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter an exact 4-digit numeric PIN')),
                );
                return;
              }
              await PinAuthService.setSecurityPin(pin);
              if (ctx.mounted) {
                Navigator.pop(ctx);
              }
              if (!mounted) return;
              _checkPinStatus();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('4-digit Quick PIN configured successfully')),
              );
            },
            child: const Text('Save PIN'),
          ),
        ],
      ),
    );
  }

  void _handleSignOut() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Confirm Sign Out', style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to sign out of your mobile session?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ApiService.clearCurrentUser();
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final initials = _currentUser.name.isNotEmpty
        ? _currentUser.name.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('').toUpperCase()
        : 'U';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile & Security', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Server Gateway',
            onPressed: () => ServerConfigDialog.show(context),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── USER IDENTITY CARD ──
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: AppColors.primaryNavy,
                  child: Text(
                    initials.length > 2 ? initials.substring(0, 2) : initials,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  _currentUser.name,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryNavy),
                ),
                const SizedBox(height: 4),
                Text(_currentUser.email, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                if (_currentUser.phone != null && _currentUser.phone!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(_currentUser.phone!, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
                ],
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.accentGold.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.accentGold.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    _currentUser.roleDisplay.toUpperCase(),
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primaryNavy, letterSpacing: 0.5),
                  ),
                ),
                if (_currentUser.designation != null && _currentUser.designation!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    _currentUser.designation!,
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey.shade600),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 18),

          // ── PROFILE ACTION CARDS ──
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.person_outline, color: AppColors.primaryNavy),
                  title: const Text('Edit Personal Details', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: const Text('Update your display name, phone & designation', style: TextStyle(fontSize: 12)),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _showEditProfileDialog,
                ),
                const Divider(height: 1, indent: 56),
                ListTile(
                  leading: const Icon(Icons.lock_reset, color: AppColors.primaryNavy),
                  title: const Text('Change Password', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: const Text('Update login security password', style: TextStyle(fontSize: 12)),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _showChangePasswordDialog,
                ),
                const Divider(height: 1, indent: 56),
                ListTile(
                  leading: const Icon(Icons.pin, color: AppColors.primaryNavy),
                  title: const Text('4-Digit Security PIN', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: Text(_pinEnabled ? 'PIN is enabled (Tap to reconfigure)' : 'Quick unlock for job sites', style: const TextStyle(fontSize: 12)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_pinEnabled)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(4)),
                          child: const Text('ACTIVE', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      const Icon(Icons.chevron_right),
                    ],
                  ),
                  onTap: _showPinSetupDialog,
                ),
                const Divider(height: 1, indent: 56),
                ListTile(
                  leading: const Icon(Icons.dns_outlined, color: AppColors.primaryNavy),
                  title: const Text('Server Gateway Configuration', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: const Text('View & test backend connection URL', style: TextStyle(fontSize: 12)),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => ServerConfigDialog.show(context),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ── SIGN OUT BUTTON ──
          OutlinedButton.icon(
            onPressed: _handleSignOut,
            icon: const Icon(Icons.logout, color: Colors.red),
            label: const Text('Sign Out from Mobile Session', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w700)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.red),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
          const SizedBox(height: 16),
          const Center(
            child: Text(
              'I Roofing Enterprises Mobile v1.0.0 · Powered by Auxzon',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }
}
