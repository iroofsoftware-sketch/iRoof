import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';
import '../../services/api_service.dart';
import '../../services/roof_calc_service.dart';

class SiteInspectionForm extends StatefulWidget {
  final Map<String, dynamic>? initialData;

  const SiteInspectionForm({super.key, this.initialData});

  @override
  State<SiteInspectionForm> createState() => _SiteInspectionFormState();
}

class _SiteInspectionFormState extends State<SiteInspectionForm> {
  final _formKey = GlobalKey<FormState>();

  final _clientNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _projectController = TextEditingController();
  final _addressController = TextEditingController();

  final _spanController = TextEditingController(text: '20.0');
  final _lengthController = TextEditingController(text: '40.0');
  final _riseController = TextEditingController(text: '4.0');
  final _notesController = TextEditingController();

  String _substructure = 'RCC Girders / Beams';
  String _siteAccess = 'Heavy Vehicle / Crane Accessible';
  String _roofModel = 'Standard Curved Arch';
  bool _submitting = false;

  RoofCalculationResult? _calculation;
  final _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹ ', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    if (widget.initialData != null) {
      _clientNameController.text = widget.initialData!['clientName'] ?? '';
      _phoneController.text = widget.initialData!['phone'] ?? '';
      _addressController.text = widget.initialData!['location'] ?? '';
      _spanController.text = (widget.initialData!['proposedSpan'] ?? 20.0).toString();
      _lengthController.text = (widget.initialData!['proposedLength'] ?? 40.0).toString();
    }
    _recalc();
  }

  @override
  void dispose() {
    _clientNameController.dispose();
    _phoneController.dispose();
    _projectController.dispose();
    _addressController.dispose();
    _spanController.dispose();
    _lengthController.dispose();
    _riseController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _recalc() {
    final span = double.tryParse(_spanController.text) ?? 20.0;
    final length = double.tryParse(_lengthController.text) ?? 40.0;
    final rise = double.tryParse(_riseController.text);

    setState(() {
      _calculation = RoofCalcService.calculate(
        span: span,
        length: length,
        rise: rise,
        modelName: _roofModel,
      );
    });
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);

    final payload = {
      'clientName': _clientNameController.text.trim(),
      'phone': _phoneController.text.trim(),
      'projectName': _projectController.text.trim(),
      'location': _addressController.text.trim(),
      'proposedSpan': double.tryParse(_spanController.text) ?? 20.0,
      'proposedLength': double.tryParse(_lengthController.text) ?? 40.0,
      'proposedRise': double.tryParse(_riseController.text) ?? 4.0,
      'substructure': _substructure,
      'siteAccess': _siteAccess,
      'roofModel': _roofModel,
      'estimatedCost': _calculation?.estimatedCost ?? 0,
      'notes': _notesController.text.trim(),
      'inspectedAt': DateTime.now().toIso8601String(),
      'status': 'inspected',
    };

    try {
      final ok = await ApiService.submitSiteInspection(payload);
      if (!mounted) return;
      if (ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Site Inspection & Consultation Recorded Successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Submission error: $e')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Site Inspection & Consult Form', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. CLIENT & SITE INFO
              _buildSectionCard(
                title: '1. Client & Site Location',
                icon: Icons.person_pin_circle_outlined,
                children: [
                  TextFormField(
                    controller: _clientNameController,
                    decoration: const InputDecoration(labelText: 'Client / Company Name *', border: OutlineInputBorder()),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter client name' : null,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(labelText: 'Phone Number *', border: OutlineInputBorder()),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter phone' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _projectController,
                          decoration: const InputDecoration(labelText: 'Project Name / Bay', border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _addressController,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Site Address & Landmarks *', border: OutlineInputBorder()),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter site address' : null,
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // 2. STRUCTURAL DIMENSIONS & LIVE ESTIMATE
              _buildSectionCard(
                title: '2. Roof Geometry & Field Measurement',
                icon: Icons.straighten_outlined,
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _roofModel,
                    decoration: const InputDecoration(labelText: 'Proposed Structural Model', border: OutlineInputBorder()),
                    items: ['Standard Curved Arch', 'Raised Arch / Warehouse', 'High-Volume Hangar']
                        .map((m) => DropdownMenuItem(value: m, child: Text(m, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _roofModel = val);
                        _recalc();
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _spanController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'Clear Span (m) *', border: OutlineInputBorder(), suffixText: 'm'),
                          onChanged: (_) => _recalc(),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _lengthController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'Length (m) *', border: OutlineInputBorder(), suffixText: 'm'),
                          onChanged: (_) => _recalc(),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _riseController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Arch Rise / Height (m)', border: OutlineInputBorder(), suffixText: 'm'),
                    onChanged: (_) => _recalc(),
                  ),

                  // LIVE PREVIEW BADGE INSIDE FORM
                  if (_calculation != null) ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primaryNavy.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.primaryNavy.withValues(alpha: 0.15)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Live Field Quote Value:', style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 2),
                              Text(
                                _currencyFormat.format(_calculation!.estimatedCost),
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryNavy),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('${_calculation!.roofAreaSqFt.toStringAsFixed(0)} sq.ft', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                              Text('${(_calculation!.estimatedSteelWeightKg / 1000).toStringAsFixed(2)} Ton Steel', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),

              const SizedBox(height: 16),

              // 3. SUBSTRUCTURE & SITE CONDITIONS
              _buildSectionCard(
                title: '3. Column & Site Environment',
                icon: Icons.foundation_outlined,
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: _substructure,
                    decoration: const InputDecoration(labelText: 'Substructure / Support Columns', border: OutlineInputBorder()),
                    items: [
                      'RCC Girders / Beams',
                      'Steel Stanchions / Columns',
                      'Masonry Wall Plates',
                      'Greenfield Ground Setup (Needs RCC)',
                    ].map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _substructure = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _siteAccess,
                    decoration: const InputDecoration(labelText: 'Road Access & Crane Clearance', border: OutlineInputBorder()),
                    items: [
                      'Heavy Vehicle / Crane Accessible',
                      'Narrow Access (Manual Handling Needed)',
                      'Restricted Time (Night Erection Only)',
                    ].map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _siteAccess = val);
                    },
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // 4. NOTES & CLIENT PREFERENCES
              _buildSectionCard(
                title: '4. Consultation Notes & Next Steps',
                icon: Icons.speaker_notes_outlined,
                children: [
                  TextFormField(
                    controller: _notesController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Customer Requirements / Discussion Points',
                      hintText: 'e.g. Client requested Off-White shade with polycarbonate skylights. Foundation ready by 25th.',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // SUBMIT BUTTON
              ElevatedButton.icon(
                onPressed: _submitting ? null : _handleSubmit,
                icon: _submitting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.check_circle),
                label: Text(
                  _submitting ? 'Submitting to CRM...' : 'Save Inspection & Generate Lead',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryNavy,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
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
              children: [
                Icon(icon, size: 20, color: AppColors.primaryNavy),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5, color: AppColors.primaryNavy)),
              ],
            ),
            const SizedBox(height: 14),
            ...children,
          ],
        ),
      ),
    );
  }
}
