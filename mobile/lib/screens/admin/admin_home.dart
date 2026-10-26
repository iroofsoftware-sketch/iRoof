import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../common/server_config_dialog.dart';
import '../login_screen.dart';
import '../site_visitor/quick_estimator_screen.dart';
import '../site_visitor/site_inspection_form.dart';

class AdminHome extends StatefulWidget {
  final UserModel user;

  const AdminHome({super.key, required this.user});

  @override
  State<AdminHome> createState() => _AdminHomeState();
}

class _AdminHomeState extends State<AdminHome> {
  int _workOrdersCount = 0;
  int _visitsCount = 0;
  double _pipelineTotal = 0;
  int _enquiriesCount = 0;
  final _currency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _loadOverview();
  }

  Future<void> _loadOverview() async {
    try {
      final wos = await ApiService.getWorkOrders();
      final svs = await ApiService.getSiteVisits();
      final enqs = await ApiService.getEnquiries();

      double total = 0;
      for (final wo in wos) {
        if (wo['grandTotal'] is num) {
          total += (wo['grandTotal'] as num).toDouble();
        }
      }

      if (mounted) {
        setState(() {
          _workOrdersCount = wos.length;
          _visitsCount = svs.length;
          _pipelineTotal = total;
          _enquiriesCount = enqs.length;
        });
      }
    } catch (_) {}
  }

  void _logout() async {
    await ApiService.clearCurrentUser();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Dynamic conversion rate calculation
    final conversionRate = _enquiriesCount > 0
        ? '${((_workOrdersCount / _enquiriesCount) * 100).round()}%'
        : (_workOrdersCount > 0 ? '100%' : '0%');

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.user.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            const Text('Executive Director Console', style: TextStyle(fontSize: 11, color: AppColors.accentGold)),
          ],
        ),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => ServerConfigDialog.show(context),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Executive KPI Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primaryNavy, AppColors.primaryDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Company Commercial Overview', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 6),
                  Text(
                    _currency.format(_pipelineTotal),
                    style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  const Text('Total Active Pipeline Across Commercial Warehouses', style: TextStyle(color: Colors.white54, fontSize: 11)),
                  const Divider(color: Colors.white24, height: 26),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMiniStat('Active Work Orders', '$_workOrdersCount'),
                      _buildMiniStat('Site Visits This Month', '$_visitsCount'),
                      _buildMiniStat('Conversion Rate', conversionRate),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Text('Quick Field Access', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
            const SizedBox(height: 12),

            // Quick Tool Launchers
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: AppColors.primaryNavy,
                  child: Icon(Icons.add_location_alt, color: Colors.white),
                ),
                title: const Text('Perform On-Site Inspection', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                subtitle: const Text('Capture site parameters, dimensions & client consult', style: TextStyle(fontSize: 12)),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const SiteInspectionForm()));
                },
              ),
            ),
            const SizedBox(height: 8),

            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: AppColors.accentGold,
                  child: Icon(Icons.calculate, color: Colors.white),
                ),
                title: const Text('Field Roof Estimator', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                subtitle: const Text('Real-time structural arc & commercial quote calculator', style: TextStyle(fontSize: 12)),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const QuickEstimatorScreen()));
                },
              ),
            ),

            const SizedBox(height: 36),
            const Center(
              child: Text(
                'I Roofing Enterprises · Architectural Roofing Systems',
                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 10)),
      ],
    );
  }
}
