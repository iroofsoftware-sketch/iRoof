import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../../services/pin_auth_service.dart';
import '../common/server_config_dialog.dart';
import '../common/work_order_detail_screen.dart';
import '../common/profile_screen.dart';
import '../notifications_sheet.dart';
import '../login_screen.dart';
import '../site_visitor/quick_estimator_screen.dart';

class AdminTabScaffold extends StatefulWidget {
  final UserModel user;

  const AdminTabScaffold({super.key, required this.user});

  @override
  State<AdminTabScaffold> createState() => _AdminTabScaffoldState();
}

class _AdminTabScaffoldState extends State<AdminTabScaffold> {
  int _currentIndex = 0;
  List<Map<String, dynamic>> _workOrders = [];
  List<Map<String, dynamic>> _enquiries = [];
  List<Map<String, dynamic>> _users = [];
  Map<String, dynamic> _stats = {};
  bool _loading = true;
  int _unreadNotifications = 0;
  final _currency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  Future<void> _loadAllData() async {
    setState(() => _loading = true);
    final orders = await ApiService.getWorkOrders();
    final stats = await ApiService.getWorkOrderStats();
    final enquiries = await ApiService.getEnquiries();
    final users = await ApiService.getUsers();
    final notifs = await ApiService.getNotifications();

    if (!mounted) return;
    setState(() {
      _workOrders = orders;
      _stats = stats;
      _enquiries = enquiries;
      _users = users;
      _unreadNotifications = notifs['unreadCount'] ?? 0;
      _loading = false;
    });
  }

  void _handleSignOut() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Confirm Sign Out', style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to end your current session?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
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

  String get _roleTitle {
    final r = widget.user.role.toLowerCase();
    if (r == 'admin') return 'Administration Console';
    if (r == 'sales') return 'Sales & Commercial Suite';
    return '${widget.user.role.toUpperCase()} Workspace';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        titleSpacing: 18,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'iRoofing · ${_roleTitle.split(' ')[0]}',
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16.5, letterSpacing: -0.3),
            ),
            Text(
              '${widget.user.name} (${widget.user.role.toUpperCase()})',
              style: const TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w500),
            ),
          ],
        ),
        backgroundColor: AppColors.primaryNavy,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.calculate_outlined, color: AppColors.accentGold, size: 18),
            ),
            tooltip: 'Field Roof Estimator',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const QuickEstimatorScreen()),
            ),
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_rounded, size: 22),
                tooltip: 'Notifications',
                onPressed: () {
                  NotificationsSheet.show(context);
                  setState(() => _unreadNotifications = 0);
                },
              ),
              if (_unreadNotifications > 0)
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: AppColors.accentGold, shape: BoxShape.circle),
                    child: Text(
                      '$_unreadNotifications',
                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.primaryNavy),
                    ),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.tune_outlined, size: 20),
            tooltip: 'Server Settings',
            onPressed: () => ServerConfigDialog.show(context),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primaryNavy))
          : IndexedStack(
              index: _currentIndex,
              children: [
                _buildPipelineTab(),
                _buildWorkOrdersTab(),
                _buildEnquiriesTab(),
                _buildTeamTab(),
                ProfileScreen(user: widget.user),
              ],
            ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.border, width: 0.8)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 10,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          backgroundColor: Colors.transparent,
          selectedItemColor: AppColors.primaryNavy,
          unselectedItemColor: AppColors.textMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.pie_chart_outline_rounded),
              activeIcon: Icon(Icons.pie_chart_rounded),
              label: 'Pipeline',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.engineering_outlined),
              activeIcon: Icon(Icons.engineering_rounded),
              label: 'Work Orders',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.contact_mail_outlined),
              activeIcon: Icon(Icons.contact_mail_rounded),
              label: 'Enquiries',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.group_outlined),
              activeIcon: Icon(Icons.group_rounded),
              label: 'Team',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  // ── TAB 1: EXECUTIVE PIPELINE OVERVIEW ──
  Widget _buildPipelineTab() {
    double totalVal = 0;
    for (final wo in _workOrders) {
      if (wo['grandTotal'] is num) {
        totalVal += (wo['grandTotal'] as num).toDouble();
      }
    }

    return RefreshIndicator(
      onRefresh: _loadAllData,
      color: AppColors.primaryNavy,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          // Commercial Valuation Hero Card
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF040E1E), Color(0xFF071B38), Color(0xFF0B2E59)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryNavy.withValues(alpha: 0.25),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Commercial Production Pipeline',
                      style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: AppColors.accentGold.withValues(alpha: 0.20),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.accentGold.withValues(alpha: 0.40)),
                      ),
                      child: const Text(
                        'LIVE VALUE',
                        style: TextStyle(color: AppColors.accentGold, fontSize: 9.5, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  _currency.format(totalVal),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Active arch roofing contracts & factory fabrications',
                  style: TextStyle(color: Colors.white60, fontSize: 11.5),
                ),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildHeroStat('Active Orders', '${_workOrders.length} WOs'),
                      Container(width: 1, height: 26, color: Colors.white24),
                      _buildHeroStat('Leads Pipeline', '${_enquiries.length} Leads'),
                      Container(width: 1, height: 26, color: Colors.white24),
                      _buildHeroStat('Staff Force', '${_users.length} Users'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),
          const Text(
            'Stage Gate Distribution',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary, letterSpacing: -0.2),
          ),
          const SizedBox(height: 12),

          // Stage Counts
          Row(
            children: [
              Expanded(child: _buildStageStatCard('Pending Accounts', '${_stats['pending_accounts'] ?? 0}', Colors.amber.shade800, AppColors.warningLight)),
              const SizedBox(width: 10),
              Expanded(child: _buildStageStatCard('Handover Completed', '${_stats['completed'] ?? 0}', AppColors.successGreen, AppColors.successLight)),
              const SizedBox(width: 10),
              Expanded(child: _buildStageStatCard('Gate 4 PM Review', '${_stats['pending_pm_review'] ?? 0}', AppColors.info, AppColors.infoLight)),
            ],
          ),

          const SizedBox(height: 24),

          // Quick Action Cards
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Executive Quick Utilities',
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.primaryNavySurface, borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.calculate_outlined, color: AppColors.primaryNavy, size: 20),
                  ),
                  title: const Text('Launch Field Roof Estimator', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5)),
                  subtitle: const Text('Geometric arc calculation & costing', style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                  trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QuickEstimatorScreen())),
                ),
                const Divider(height: 14, color: AppColors.borderLight),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.accentGoldMuted, borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.pin_outlined, color: AppColors.accentGold, size: 20),
                  ),
                  title: const Text('Security PIN Protection', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5)),
                  subtitle: const Text('Set 4-digit PIN for instant biometric/PIN unlock', style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                  trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                  onTap: _showPinSetupDialog,
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          OutlinedButton.icon(
            onPressed: _handleSignOut,
            icon: const Icon(Icons.logout_rounded, color: AppColors.danger, size: 18),
            label: const Text('Sign Out of Session', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700, fontSize: 13.5)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFFCA5A5)),
              backgroundColor: AppColors.dangerLight,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  void _showPinSetupDialog() {
    final pinCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Quick PIN Setup', style: TextStyle(fontWeight: FontWeight.w700)),
        content: TextField(
          controller: pinCtrl,
          keyboardType: TextInputType.number,
          maxLength: 4,
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'New 4-Digit PIN',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryNavy,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              if (pinCtrl.text.length == 4) {
                await PinAuthService.setSecurityPin(pinCtrl.text);
                if (ctx.mounted) Navigator.pop(ctx);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Security PIN successfully configured!')),
                  );
                }
              }
            },
            child: const Text('Save PIN'),
          ),
        ],
      ),
    );
  }

  // ── TAB 2: ALL WORK ORDERS LIST ──
  Widget _buildWorkOrdersTab() {
    return RefreshIndicator(
      onRefresh: _loadAllData,
      color: AppColors.primaryNavy,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Production Contracts (${_workOrders.length})',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              IconButton(icon: const Icon(Icons.refresh_rounded, size: 20, color: AppColors.primaryNavy), onPressed: _loadAllData),
            ],
          ),
          const SizedBox(height: 8),
          if (_workOrders.isEmpty)
            _buildEmptyState('No Work Orders Yet', 'Active structural contracts will appear here.')
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _workOrders.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final wo = _workOrders[index];
                final total = wo['grandTotal'] != null ? _currency.format(wo['grandTotal']) : '₹ --';
                final status = (wo['status'] ?? 'pending').toString().replaceAll('_', ' ');

                return InkWell(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => WorkOrderDetailScreen(workOrder: wo, isPm: true)),
                  ),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.primaryNavySurface,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                wo['refCode'] ?? 'WO',
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: AppColors.primaryNavy),
                              ),
                            ),
                            Text(
                              total,
                              style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          wo['clientName'] ?? 'Client',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                wo['siteAddress'] ?? 'Site Location',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              wo['roofModel'] ?? 'Arch Structure',
                              style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                              decoration: BoxDecoration(
                                color: AppColors.successLight,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                status.toUpperCase(),
                                style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w700, color: AppColors.success),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  // ── TAB 3: ALL ENQUIRIES LIST ──
  Widget _buildEnquiriesTab() {
    return RefreshIndicator(
      onRefresh: _loadAllData,
      color: AppColors.primaryNavy,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Commercial Leads (${_enquiries.length})',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              IconButton(icon: const Icon(Icons.refresh_rounded, size: 20, color: AppColors.primaryNavy), onPressed: _loadAllData),
            ],
          ),
          const SizedBox(height: 8),
          if (_enquiries.isEmpty)
            _buildEmptyState('No Enquiries Found', 'Incoming client consultations will appear here.')
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _enquiries.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final enq = _enquiries[index];
                final status = (enq['status'] ?? 'new').toString();

                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                    boxShadow: AppColors.cardShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              enq['clientName'] ?? 'Prospect Client',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5, color: AppColors.textPrimary),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.primaryNavySurface,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              status.toUpperCase(),
                              style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.phone_outlined, size: 14, color: AppColors.primaryNavy),
                          const SizedBox(width: 6),
                          Text(
                            enq['phone'] ?? 'No phone provided',
                            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              enq['address'] ?? 'Site location pending',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  // ── TAB 4: USER MANAGEMENT DIRECTORY ──
  Widget _buildTeamTab() {
    return RefreshIndicator(
      onRefresh: _loadAllData,
      color: AppColors.primaryNavy,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Enterprise Personnel (${_users.length})',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              IconButton(icon: const Icon(Icons.refresh_rounded, size: 20, color: AppColors.primaryNavy), onPressed: _loadAllData),
            ],
          ),
          const SizedBox(height: 2),
          const Text(
            'Authorized staff directory & operational role assignments',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 14),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _users.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final u = _users[index];
              final initials = (u['name'] ?? 'U')
                  .toString()
                  .split(' ')
                  .map((w) => w.isNotEmpty ? w[0] : '')
                  .take(2)
                  .join('')
                  .toUpperCase();

              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppColors.cardShadow,
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.primaryNavy,
                      child: Text(
                        initials,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            u['name'] ?? 'Staff Member',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            u['email'] ?? '',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.accentGoldMuted,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.accentGold.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        (u['role'] ?? 'staff').toString().toUpperCase(),
                        style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: AppColors.primaryNavy),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(Icons.inventory_2_outlined, size: 44, color: Colors.grey.shade400),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildHeroStat(String title, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.w500)),
        const SizedBox(height: 3),
        Text(val, style: const TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w800)),
      ],
    );
  }

  Widget _buildStageStatCard(String label, String value, Color color, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 10.5, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }
}
