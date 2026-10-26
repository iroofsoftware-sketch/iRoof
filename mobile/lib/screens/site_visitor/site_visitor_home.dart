import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../common/server_config_dialog.dart';
import '../login_screen.dart';
import 'quick_estimator_screen.dart';
import 'site_inspection_form.dart';

class SiteVisitorHome extends StatefulWidget {
  final UserModel user;

  const SiteVisitorHome({super.key, required this.user});

  @override
  State<SiteVisitorHome> createState() => _SiteVisitorHomeState();
}

class _SiteVisitorHomeState extends State<SiteVisitorHome> {
  List<Map<String, dynamic>> _visits = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadVisits();
  }

  Future<void> _loadVisits() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getSiteVisits();
      if (mounted) setState(() => _visits = list);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.user.name,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
            ),
            const Text(
              'Field Sales & Site Consultation',
              style: TextStyle(fontSize: 11, color: AppColors.accentGold),
            ),
          ],
        ),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.calculate_outlined),
            tooltip: 'Quick Estimator',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const QuickEstimatorScreen()),
              );
            },
          ),
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
        onRefresh: _loadVisits,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── HERO ACTION CARD ──
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryNavy, AppColors.primaryDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.location_city, color: AppColors.accentGold, size: 22),
                        SizedBox(width: 8),
                        Text(
                          'On-Site Client Consultation',
                          style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Capture site dimensions, assess column infrastructure, and provide instant commercial quotes directly to the client.',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () async {
                              final created = await Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const SiteInspectionForm()),
                              );
                              if (created == true) _loadVisits();
                            },
                            icon: const Icon(Icons.add, size: 18),
                            label: const Text('New Site Inspection', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accentGold,
                              foregroundColor: AppColors.primaryDark,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        OutlinedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const QuickEstimatorScreen()),
                            );
                          },
                          icon: const Icon(Icons.calculate, size: 18, color: Colors.white),
                          label: const Text('Calculator', style: TextStyle(color: Colors.white, fontSize: 12.5)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Colors.white38),
                            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // ── CONSULTATION METRICS ROW ──
              Builder(
                builder: (context) {
                  final completedCount = _visits.where((v) {
                    final status = (v['status'] ?? '').toString().toLowerCase();
                    return status == 'completed' || status == 'visited' || status == 'inspected';
                  }).length;
                  final winRate = _visits.isNotEmpty
                      ? '${((completedCount / _visits.length) * 100).round()}%'
                      : '0%';

                  return Row(
                    children: [
                      Expanded(child: _buildMetricTile('Scheduled', '${_visits.length}', Icons.calendar_today, Colors.blue)),
                      const SizedBox(width: 10),
                      Expanded(child: _buildMetricTile('Completed', '$completedCount', Icons.verified, AppColors.success)),
                      const SizedBox(width: 10),
                      Expanded(child: _buildMetricTile('Action Rate', winRate, Icons.trending_up, AppColors.accentGold)),
                    ],
                  );
                },
              ),

              const SizedBox(height: 24),

              // ── ASSIGNED VISITS LIST ──
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Assigned Consultations & Sites',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                  ),
                  TextButton.icon(
                    onPressed: _loadVisits,
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text('Refresh', style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (_loading)
                const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator()))
              else if (_visits.isEmpty)
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Center(
                      child: Text('No site inspections pending. Tap "+ New Site Inspection" to start.'),
                    ),
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _visits.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = _visits[index];
                    return _buildVisitCard(item);
                  },
                ),

              const SizedBox(height: 30),

              // Brand Sign-off
              const Center(
                child: Text(
                  'I Roofing Enterprises · Architectural Roofing Systems',
                  style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildVisitCard(Map<String, dynamic> item) {
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
                Expanded(
                  child: Text(
                    item['clientName'] ?? 'Client Inspection',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.primaryNavy),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: item['status'] == 'Quoted' ? AppColors.successLight : AppColors.warningLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    item['status'] ?? 'Scheduled',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: item['status'] == 'Quoted' ? AppColors.success : AppColors.warning,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 15, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    item['location'] ?? 'Site Location',
                    style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.straighten, size: 15, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  'Proposed: ${item['proposedSpan']}m Span × ${item['proposedLength']}m Length',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                ),
              ],
            ),
            if (item['notes'] != null && (item['notes'] as String).isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(6)),
                child: Text(
                  item['notes'],
                  style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                ),
              ),
            ],
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => SiteInspectionForm(initialData: item),
                      ),
                    );
                  },
                  icon: const Icon(Icons.edit_note, size: 18),
                  label: const Text('Consult / Edit'),
                  style: TextButton.styleFrom(foregroundColor: AppColors.primaryNavy),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
