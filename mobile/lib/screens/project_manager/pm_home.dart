import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../common/server_config_dialog.dart';
import '../login_screen.dart';

class PmHome extends StatefulWidget {
  final UserModel user;

  const PmHome({super.key, required this.user});

  @override
  State<PmHome> createState() => _PmHomeState();
}

class _PmHomeState extends State<PmHome> {
  List<Map<String, dynamic>> _workOrders = [];
  bool _loading = true;
  final _currency = NumberFormat.currency(locale: 'en_IN', symbol: '₹ ', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getWorkOrders();
      if (mounted) setState(() => _workOrders = list);
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _logout() async {
    await ApiService.clearCurrentUser();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'in_fabrication':
        return Colors.blue;
      case 'completed':
        return AppColors.success;
      case 'pending_delivery':
        return AppColors.warning;
      case 'pending_design':
        return Colors.purple;
      default:
        return AppColors.textSecondary;
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
            Text(widget.user.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            const Text('Project Management Operations', style: TextStyle(fontSize: 11, color: AppColors.accentGold)),
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
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Summary Banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.primaryNavy,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Active Project Custody', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        const SizedBox(height: 4),
                        Text('${_workOrders.length} Work Orders', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                      ],
                    ),
                    const Icon(Icons.engineering_outlined, color: AppColors.accentGold, size: 36),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              const Text('Active Work Orders & Stage Gates', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
              const SizedBox(height: 10),

              if (_loading)
                const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator()))
              else if (_workOrders.isEmpty)
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.inbox_outlined, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text(
                        'No Work Orders Yet',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.primaryNavy),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Work orders created by Sales/Admin will appear here with live 7-gate tracking.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _workOrders.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final wo = _workOrders[index];
                    final status = wo['status'] ?? 'pending';
                    final color = _getStatusColor(status);

                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: AppColors.border),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: AppColors.primaryNavy.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(6)),
                                  child: Text(wo['refCode'] ?? 'WO', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.primaryNavy)),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
                                  child: Text(status.replaceAll('_', ' ').toUpperCase(), style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: color)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(wo['clientName'] ?? 'Client', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            Text(wo['siteAddress'] ?? 'Site Location', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                            const Divider(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('${wo['span']}m Span × ${wo['length']}m Length', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                Text(
                                  _currency.format(wo['grandTotal'] ?? 0),
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryNavy),
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
        ),
      ),
    );
  }
}
