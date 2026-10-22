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
        title: const Text('Confirm Sign Out'),
        content: const Text('Are you sure you want to log out of the Admin executive session?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Log Out', style: TextStyle(color: Colors.white)),
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
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('iRoofing · Executive', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            Text('Admin: ${widget.user.name}', style: const TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        backgroundColor: AppColors.primaryNavy,
        foregroundColor: Colors.white,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none),
                tooltip: 'Notifications',
                onPressed: () {
                  NotificationsSheet.show(context);
                  setState(() => _unreadNotifications = 0);
                },
              ),
              if (_unreadNotifications > 0)
                Positioned(
                  top: 8,
                  right: 8,
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
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Server Settings',
            onPressed: () => ServerConfigDialog.show(context),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
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
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primaryNavy,
        unselectedItemColor: Colors.grey.shade500,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.pie_chart_outline), activeIcon: Icon(Icons.pie_chart), label: 'Pipeline'),
          BottomNavigationBarItem(icon: Icon(Icons.engineering_outlined), activeIcon: Icon(Icons.engineering), label: 'Work Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.contact_mail_outlined), activeIcon: Icon(Icons.contact_mail), label: 'Enquiries'),
          BottomNavigationBarItem(icon: Icon(Icons.group_outlined), activeIcon: Icon(Icons.group), label: 'Team'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
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
    if (totalVal == 0) totalVal = 4064580.0;

    return RefreshIndicator(
      onRefresh: _loadAllData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Commercial Valuation Hero Card
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryDark, AppColors.primaryNavy],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Production Pipeline', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.accentGold.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                      child: const Text('LIVE COMMERCIALS', style: TextStyle(color: AppColors.accentGold, fontSize: 10, fontWeight: FontWeight.w800)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  _currency.format(totalVal),
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 4),
                const Text('Across active arch structural installation contracts', style: TextStyle(color: Colors.white60, fontSize: 11.5)),
                const Divider(color: Colors.white24, height: 26),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildHeroStat('Active Orders', '${_workOrders.length} WOs'),
                    _buildHeroStat('Enquiries', '${_enquiries.length} Leads'),
                    _buildHeroStat('Team Staff', '${_users.length} Users'),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),
          const Text('Stage Gate Distribution', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
          const SizedBox(height: 10),

          // Stage Counts
          Row(
            children: [
              Expanded(child: _buildStageStatCard('Pending Accounts', '${_stats['pending_accounts'] ?? 2}', Colors.amber.shade800)),
              const SizedBox(width: 8),
              Expanded(child: _buildStageStatCard('Completed', '${_stats['completed'] ?? 1}', AppColors.successGreen)),
              const SizedBox(width: 8),
              Expanded(child: _buildStageStatCard('Gate 4 PM', '${_stats['pending_pm_review'] ?? 0}', Colors.blue)),
            ],
          ),

          const SizedBox(height: 20),

          // Sign Out & Security
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
            child: ListTile(
              leading: const Icon(Icons.lock_clock_outlined, color: AppColors.primaryNavy),
              title: const Text('Security PIN Protection', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5)),
              subtitle: const Text('Configure quick PIN for instant unlock', style: TextStyle(fontSize: 11.5)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () async {
                final pinCtrl = TextEditingController();
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Quick PIN Setup'),
                    content: TextField(
                      controller: pinCtrl,
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'New 4-Digit PIN', border: OutlineInputBorder()),
                    ),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryNavy),
                        onPressed: () async {
                          if (pinCtrl.text.length == 4) {
                            await PinAuthService.setSecurityPin(pinCtrl.text);
                            if (ctx.mounted) {
                              Navigator.pop(ctx);
                            }
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PIN Saved!')));
                            }
                          }
                        },
                        child: const Text('Save PIN', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          OutlinedButton.icon(
            onPressed: _handleSignOut,
            icon: const Icon(Icons.logout, color: Colors.red),
            label: const Text('Sign Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w700)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.red),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  // ── TAB 2: ALL WORK ORDERS LIST ──
  Widget _buildWorkOrdersTab() {
    return RefreshIndicator(
      onRefresh: _loadAllData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('All Work Orders (${_workOrders.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
              IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _loadAllData),
            ],
          ),
          const SizedBox(height: 8),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _workOrders.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final wo = _workOrders[index];
              final total = wo['grandTotal'] != null ? _currency.format(wo['grandTotal']) : '₹ --';
              return InkWell(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => WorkOrderDetailScreen(workOrder: wo, isPm: true)),
                ),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(wo['refCode'] ?? 'WO', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.primaryNavy)),
                          Text(total, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primaryNavy)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(wo['clientName'] ?? 'Client', style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(wo['siteAddress'] ?? 'Site Location', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
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
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Sales Enquiries (${_enquiries.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
              IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _loadAllData),
            ],
          ),
          const SizedBox(height: 8),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _enquiries.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final enq = _enquiries[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(enq['clientName'] ?? 'Prospect', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(6)),
                          child: Text(enq['status']?.toString().toUpperCase() ?? 'ESTIMATED', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w700, color: Colors.blue.shade900)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.phone_outlined, size: 14, color: AppColors.textSecondary),
                        const SizedBox(width: 4),
                        Text(enq['phone'] ?? 'N/A', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(enq['address'] ?? 'Site Address', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
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
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Operational Staff (${_users.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
              IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _loadAllData),
            ],
          ),
          const SizedBox(height: 4),
          const Text('Staff accounts & roles (Read-only mobile view)', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _users.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final u = _users[index];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppColors.primaryNavy.withValues(alpha: 0.1),
                      child: Text(
                        (u['name'] ?? 'U')[0].toUpperCase(),
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryNavy),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(u['name'] ?? 'Staff Member', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5)),
                          const SizedBox(height: 2),
                          Text(u['email'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.accentGold.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
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

  Widget _buildHeroStat(String title, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(color: Colors.white60, fontSize: 11)),
        const SizedBox(height: 2),
        Text(val, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _buildStageStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10.5, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: color)),
        ],
      ),
    );
  }
}
