import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../common/server_config_dialog.dart';
import '../common/work_order_detail_screen.dart';
import '../notifications_sheet.dart';
import 'site_visit_detail_screen.dart';
import 'quick_estimator_screen.dart';
import '../common/profile_screen.dart';

class SiteVisitorTabScaffold extends StatefulWidget {
  final UserModel user;

  const SiteVisitorTabScaffold({super.key, required this.user});

  @override
  State<SiteVisitorTabScaffold> createState() => _SiteVisitorTabScaffoldState();
}

class _SiteVisitorTabScaffoldState extends State<SiteVisitorTabScaffold> {
  int _currentIndex = 0;
  List<Map<String, dynamic>> _visits = [];
  List<Map<String, dynamic>> _workOrders = [];
  bool _loadingVisits = true;
  bool _loadingOrders = true;
  int _unreadNotifications = 0;

  @override
  void initState() {
    super.initState();
    _fetchVisits();
    _fetchOrders();
    _fetchNotifications();
  }

  Future<void> _fetchVisits() async {
    setState(() => _loadingVisits = true);
    final data = await ApiService.getSiteVisits(mineOnly: true);
    if (!mounted) return;
    setState(() {
      _visits = data;
      _loadingVisits = false;
    });
  }

  Future<void> _fetchOrders() async {
    setState(() => _loadingOrders = true);
    final data = await ApiService.getWorkOrders();
    if (!mounted) return;
    setState(() {
      _workOrders = data;
      _loadingOrders = false;
    });
  }

  Future<void> _fetchNotifications() async {
    final data = await ApiService.getNotifications();
    if (!mounted) return;
    setState(() {
      _unreadNotifications = data['unreadCount'] ?? 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('iRoofing · Field Suite', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            Text('Site Visitor: ${widget.user.name}', style: const TextStyle(fontSize: 11, color: Colors.white70)),
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
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildVisitsTab(),
          const QuickEstimatorScreen(),
          _buildWorkOrdersTab(),
          _buildProfileTab(),
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
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), activeIcon: Icon(Icons.assignment), label: 'My Visits'),
          BottomNavigationBarItem(icon: Icon(Icons.calculate_outlined), activeIcon: Icon(Icons.calculate), label: 'Estimator'),
          BottomNavigationBarItem(icon: Icon(Icons.engineering_outlined), activeIcon: Icon(Icons.engineering), label: 'Work Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  // ── TAB 1: ASSIGNED VISITS WITH PULL-TO-REFRESH ──
  Widget _buildVisitsTab() {
    if (_loadingVisits) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _fetchVisits,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Assigned Site Visits (${_visits.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
              IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _fetchVisits),
            ],
          ),
          const SizedBox(height: 8),
          if (_visits.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Icon(Icons.assignment_outlined, size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No Assigned Visits', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.primaryNavy)),
                  const SizedBox(height: 6),
                  const Text('Field site visits assigned to your profile by the Project Manager will show here.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _visits.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final v = _visits[index];
                final status = v['status'] ?? 'scheduled';
                final isDone = status == 'completed';
                return InkWell(
                  onTap: () async {
                    final res = await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => SiteVisitDetailScreen(visit: v)),
                    );
                    if (res == true) _fetchVisits();
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isDone ? AppColors.successGreen : AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(color: AppColors.primaryNavy.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(6)),
                              child: Text(v['refCode'] ?? 'SV', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: AppColors.primaryNavy)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: isDone ? Colors.green.shade50 : Colors.amber.shade50,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                status.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: isDone ? Colors.green.shade800 : Colors.amber.shade900,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(v['clientName'] ?? 'Client Consultation', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        Text(v['siteAddress'] ?? 'Site Address', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        const Divider(height: 18),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(v['visitType'] != null ? 'Type: ${v['visitType'].toString().toUpperCase()}' : 'Initial Inspection', style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                            const Row(
                              children: [
                                Text('Start Report', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                                Icon(Icons.arrow_forward_ios, size: 12, color: AppColors.primaryNavy),
                              ],
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

  // ── TAB 3: WORK ORDERS READ-ONLY LIST ──
  Widget _buildWorkOrdersTab() {
    if (_loadingOrders) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _fetchOrders,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Project Work Orders (${_workOrders.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
              IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _fetchOrders),
            ],
          ),
          const SizedBox(height: 8),
          if (_workOrders.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Icon(Icons.engineering_outlined, size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No Active Work Orders', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.primaryNavy)),
                  const SizedBox(height: 6),
                  const Text('Company structural roofing work orders and site specs will appear here.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
                ],
              ),
            )
          else
            ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _workOrders.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final wo = _workOrders[index];
              return InkWell(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => WorkOrderDetailScreen(workOrder: wo, isPm: false)),
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
                          Text(wo['status']?.toString().toUpperCase() ?? 'ACTIVE', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Colors.blue)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(wo['clientName'] ?? 'Client', style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text('${wo['roofModel'] ?? 'Arch'} · ${wo['span']}m Span x ${wo['length']}m', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
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

  // ── TAB 4: PROFILE & SECURITY PIN ──
  Widget _buildProfileTab() {
    return ProfileScreen(user: widget.user);
  }
}
