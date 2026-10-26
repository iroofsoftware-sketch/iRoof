import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';
import '../../services/api_service.dart';

class WorkOrderDetailScreen extends StatefulWidget {
  final Map<String, dynamic> workOrder;
  final bool isPm;

  const WorkOrderDetailScreen({
    super.key,
    required this.workOrder,
    this.isPm = false,
  });

  @override
  State<WorkOrderDetailScreen> createState() => _WorkOrderDetailScreenState();
}

class _WorkOrderDetailScreenState extends State<WorkOrderDetailScreen> {
  late Map<String, dynamic> _wo;
  final _currency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _wo = widget.workOrder;
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return AppColors.successGreen;
      case 'active':
      case 'in_progress':
        return Colors.blue;
      case 'pending_pm_review':
        return AppColors.accentGold;
      case 'blocked':
      case 'drawing_revision':
        return Colors.red;
      default:
        return AppColors.accentGold;
    }
  }

  Future<void> _handlePmReview(String decision) async {
    final notesController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(decision == 'approved' ? 'Approve BOM & Drawings' : 'Request Drawing Revision'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(decision == 'approved'
                ? 'Confirm approval of design drawings and release Bill of Materials (BOM) to Purchase?'
                : 'Enter specific revision notes for Design Engineering team:'),
            const SizedBox(height: 12),
            TextField(
              controller: notesController,
              decoration: const InputDecoration(
                labelText: 'Engineering / PM Remarks',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: decision == 'approved' ? AppColors.successGreen : Colors.red,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(
              decision == 'approved' ? 'Confirm Approval' : 'Submit Revision Request',
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final woId = _wo['_id'] ?? _wo['id'] ?? '';
      final ok = await ApiService.pmReviewWorkOrder(
        workOrderId: woId,
        decision: decision,
        notes: notesController.text.trim(),
      );
      if (!mounted) return;
      if (ok) {
        setState(() {
          _wo['status'] = decision == 'approved' ? 'in_progress' : 'drawing_revision';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gate 4 Decision Recorded: ${decision.toUpperCase()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = _wo['status'] ?? 'pending';
    final statusColor = _getStatusColor(status);
    final refCode = _wo['refCode'] ?? 'WO';
    final client = _wo['clientName'] ?? 'Client Name';
    final address = _wo['siteAddress'] ?? 'Site Location';
    final span = _wo['span']?.toString() ?? 'N/A';
    final length = _wo['length']?.toString() ?? 'N/A';
    final height = _wo['height']?.toString() ?? 'N/A';
    final model = _wo['roofModel'] ?? 'Arch Profile';
    final total = _wo['grandTotal'] != null ? _currency.format(_wo['grandTotal']) : '₹ --';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(refCode, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17)),
        backgroundColor: AppColors.primaryNavy,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status & Ref Banner
            Container(
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
                      Text(refCode, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryNavy)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                        child: Text(status.replaceAll('_', ' ').toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: statusColor)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(client, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Expanded(child: Text(address, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary))),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Project Valuation', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Text(total, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryNavy)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Structural Specifications Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Structural Geometry Specifications', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                  const SizedBox(height: 12),
                  _buildSpecRow('Roof Profile Model', model),
                  _buildSpecRow('Clear Span', '$span m'),
                  _buildSpecRow('Total Length', '$length m'),
                  _buildSpecRow('Rise Height', '$height m'),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 7-Gate Production Stage Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('7-Gate Lifecycle Progression', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                  const SizedBox(height: 12),
                  _buildGateItem(1, 'Sales Issuance & Order Confirmation', true),
                  _buildGateItem(2, 'Accounts Payment Clearance', true),
                  _buildGateItem(3, 'Design Drawings Submission', true),
                  _buildGateItem(4, 'PM Review & BOM Release', status != 'pending_accounts_approval'),
                  _buildGateItem(5, 'Coil & Material Procurement', status == 'completed'),
                  _buildGateItem(6, 'On-Site Forming & Seaming', status == 'completed'),
                  _buildGateItem(7, 'Hoisting & Final Handover', status == 'completed'),
                ],
              ),
            ),

            // PM Gate 4 Action Section
            if (widget.isPm) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.accentGold.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.accentGold.withValues(alpha: 0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Gate 4: PM Drawing & BOM Decision', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryNavy)),
                    const SizedBox(height: 6),
                    const Text('Review structural drawing attachments and sign-off material bill to authorize fabrication.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.successGreen,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: const Icon(Icons.check_circle_outline, size: 18),
                            label: const Text('Approve BOM', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                            onPressed: () => _handlePmReview('approved'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red.shade700,
                              side: BorderSide(color: Colors.red.shade400),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: const Icon(Icons.replay, size: 18),
                            label: const Text('Request Rev.', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                            onPressed: () => _handlePmReview('revision_requested'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildGateItem(int step, String title, bool isDone) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isDone ? AppColors.successGreen : Colors.grey.shade300,
            ),
            child: Center(
              child: isDone
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : Text('$step', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Gate $step: $title',
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: isDone ? FontWeight.w600 : FontWeight.w400,
                color: isDone ? AppColors.textPrimary : AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
