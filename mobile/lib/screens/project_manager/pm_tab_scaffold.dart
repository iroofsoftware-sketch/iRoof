import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../common/server_config_dialog.dart';
import '../common/work_order_detail_screen.dart';
import '../common/profile_screen.dart';
import '../notifications_sheet.dart';
import '../site_visitor/quick_estimator_screen.dart';

class PmTabScaffold extends StatefulWidget {
  final UserModel user;

  const PmTabScaffold({super.key, required this.user});

  @override
  State<PmTabScaffold> createState() => _PmTabScaffoldState();
}

class _PmTabScaffoldState extends State<PmTabScaffold> {
  int _currentIndex = 0;
  List<Map<String, dynamic>> _workOrders = [];
  List<Map<String, dynamic>> _siteReports = [];
  Map<String, dynamic> _stats = {};
  bool _loadingOrders = true;
  bool _loadingReports = true;
  int _unreadNotifications = 0;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
    _fetchReports();
    _fetchNotifications();
  }

  Future<void> _fetchOrders() async {
    setState(() => _loadingOrders = true);
    final orders = await ApiService.getWorkOrders();
    final stats = await ApiService.getWorkOrderStats();
    if (!mounted) return;
    setState(() {
      _workOrders = orders;
      _stats = stats;
      _loadingOrders = false;
    });
  }

  Future<void> _fetchReports() async {
    setState(() => _loadingReports = true);
    final reports = await ApiService.getSiteVisits(mineOnly: false);
    if (!mounted) return;
    setState(() {
      _siteReports = reports;
      _loadingReports = false;
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
            const Text('iRoofing · PM Control', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            Text('PM: ${widget.user.name}', style: const TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        backgroundColor: AppColors.primaryNavy,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.calculate_outlined),
            tooltip: 'Roof Estimator',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const QuickEstimatorScreen()),
            ),
          ),
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
          _buildWorkOrdersTab(),
          _buildSiteReportsTab(),
          _buildDesignReviewsTab(),
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
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Work Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.fact_check_outlined), activeIcon: Icon(Icons.fact_check), label: 'Site Reports'),
          BottomNavigationBarItem(icon: Icon(Icons.draw_outlined), activeIcon: Icon(Icons.draw), label: 'Gate 4 Review'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  // ── TAB 1: PM WORK ORDERS & PIPELINE DASHBOARD ──
  Widget _buildWorkOrdersTab() {
    if (_loadingOrders) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _fetchOrders,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // KPI Metric Row
          Row(
            children: [
              Expanded(child: _buildMetricCard('Total WOs', '${_stats['total'] ?? _workOrders.length}', AppColors.primaryNavy)),
              const SizedBox(width: 8),
              Expanded(child: _buildMetricCard('Completed', '${_stats['completed'] ?? 0}', AppColors.successGreen)),
              const SizedBox(width: 8),
              Expanded(child: _buildMetricCard('Pending PM', '${_stats['pending_pm_review'] ?? 0}', AppColors.accentGold)),
            ],
          ),

          const SizedBox(height: 18),
          const Text('Active Production Orders (7-Gate Lifecycle)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
          const SizedBox(height: 10),

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
                  Icon(Icons.assignment_outlined, size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No Active Work Orders', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.primaryNavy)),
                  const SizedBox(height: 6),
                  const Text('All project work orders and gate milestones will be listed here.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
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
              final status = wo['status'] ?? 'pending';
              return InkWell(
                onTap: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => WorkOrderDetailScreen(workOrder: wo, isPm: true)),
                  );
                  _fetchOrders();
                },
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
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: AppColors.primaryNavy.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(6)),
                            child: Text(wo['refCode'] ?? 'WO', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: AppColors.primaryNavy)),
                          ),
                          Text(status.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.blue)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(wo['clientName'] ?? 'Client', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(wo['siteAddress'] ?? 'Site Location', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      const Divider(height: 18),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${wo['roofModel'] ?? 'Arch'} · ${wo['span']}m Span x ${wo['length']}m', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                          const Row(
                            children: [
                              Text('Gate Details', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                              Icon(Icons.chevron_right, size: 16, color: AppColors.primaryNavy),
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

  // ── TAB 2: SITE REPORTS FEED FROM FIELD WORKERS ──
  Widget _buildSiteReportsTab() {
    if (_loadingReports) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _fetchReports,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Field Reports Feed (${_siteReports.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
              IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _fetchReports),
            ],
          ),
          const SizedBox(height: 8),
          if (_siteReports.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Icon(Icons.fact_check_outlined, size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No Site Reports Submitted', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.primaryNavy)),
                  const SizedBox(height: 6),
                  const Text('Field site visits and engineer consultation reports will stream live here.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _siteReports.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final r = _siteReports[index];
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
                          Text(r['refCode'] ?? 'SV', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.primaryNavy)),
                          Text(r['status']?.toString().toUpperCase() ?? 'SCHEDULED', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.green)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(r['clientName'] ?? 'Client Consultation', style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(r['siteAddress'] ?? 'Site Location', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      if (r['notes'] != null && r['notes'].toString().isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(8)),
                          child: Text('Notes: ${r['notes']}', style: const TextStyle(fontSize: 11.5, fontStyle: FontStyle.italic)),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  // ── TAB 3: GATE 4 DESIGN & BOM REVIEWS ──
  Widget _buildDesignReviewsTab() {
    return RefreshIndicator(
      onRefresh: _fetchOrders,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Gate 4: Design Review & BOM Release', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
          const SizedBox(height: 4),
          const Text('Review drawing submissions and approve Bill of Materials to unlock Workshop coil fabrication.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 14),

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
                  Icon(Icons.draw_outlined, size: 48, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No Design Submissions Pending', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.primaryNavy)),
                  const SizedBox(height: 6),
                  const Text('Design engineering submittals waiting for PM Gate 4 approval will appear here.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
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
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.accentGold.withValues(alpha: 0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(wo['refCode'] ?? 'WO', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.primaryNavy)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: AppColors.accentGold.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                          child: const Text('GATE 4 REVIEW', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: AppColors.primaryNavy)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(wo['clientName'] ?? 'Client', style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('${wo['roofModel']} · ${wo['span']}m Span', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    const Divider(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.successGreen,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                            icon: const Icon(Icons.check, size: 16),
                            label: const Text('Approve BOM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () async {
                              final woId = wo['_id'] ?? wo['id'] ?? '';
                              await ApiService.pmReviewWorkOrder(workOrderId: woId, decision: 'approved', notes: 'Approved via mobile');
                              _fetchOrders();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gate 4 Approved! Released to Purchase.')));
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red,
                              side: const BorderSide(color: Colors.red),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                            icon: const Icon(Icons.replay, size: 16),
                            label: const Text('Request Rev.', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () async {
                              final woId = wo['_id'] ?? wo['id'] ?? '';
                              await ApiService.pmReviewWorkOrder(workOrderId: woId, decision: 'revision_requested', notes: 'Revision requested via PM mobile');
                              _fetchOrders();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Revision request sent to Design team.')));
                              }
                            },
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

  // ── TAB 4: PM PROFILE & SETTINGS ──
  Widget _buildProfileTab() {
    return ProfileScreen(user: widget.user);
  }

  Widget _buildMetricCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
        ],
      ),
    );
  }
}
