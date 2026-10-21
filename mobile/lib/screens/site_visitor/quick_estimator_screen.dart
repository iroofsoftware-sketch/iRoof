import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';
import '../../services/roof_calc_service.dart';

class QuickEstimatorScreen extends StatefulWidget {
  const QuickEstimatorScreen({super.key});

  @override
  State<QuickEstimatorScreen> createState() => _QuickEstimatorScreenState();
}

class _QuickEstimatorScreenState extends State<QuickEstimatorScreen> {
  final _spanController = TextEditingController(text: '20.0');
  final _lengthController = TextEditingController(text: '40.0');
  final _riseController = TextEditingController(text: '4.0');
  double _thickness = 0.6;
  String _selectedModel = 'Standard Curved Arch';

  RoofCalculationResult? _result;

  @override
  void initState() {
    super.initState();
    _recalculate();
  }

  @override
  void dispose() {
    _spanController.dispose();
    _lengthController.dispose();
    _riseController.dispose();
    super.dispose();
  }

  void _recalculate() {
    final span = double.tryParse(_spanController.text) ?? 20.0;
    final length = double.tryParse(_lengthController.text) ?? 40.0;
    final rise = double.tryParse(_riseController.text);

    setState(() {
      _result = RoofCalcService.calculate(
        span: span,
        length: length,
        rise: rise,
        thickness: _thickness,
        modelName: _selectedModel,
      );
    });
  }

  final _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹ ', decimalDigits: 0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Field Roof Calculator', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── INPUT CARD ──
            Card(
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
                    const Text(
                      'Site Geometric Measurements',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.primaryNavy),
                    ),
                    const SizedBox(height: 14),

                    // Model Selection
                    DropdownButtonFormField<String>(
                      initialValue: _selectedModel,
                      decoration: const InputDecoration(
                        labelText: 'Structural Roof Model',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      items: [
                        'Standard Curved Arch',
                        'Raised Arch / Warehouse',
                        'High-Volume Industrial Hangar',
                        'Semi-Circular Arch'
                      ].map((m) => DropdownMenuItem(value: m, child: Text(m, style: const TextStyle(fontSize: 13)))).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() => _selectedModel = val);
                          _recalculate();
                        }
                      },
                    ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _spanController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              labelText: 'Clear Span (m)',
                              border: OutlineInputBorder(),
                              suffixText: 'm',
                            ),
                            onChanged: (_) => _recalculate(),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: _lengthController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              labelText: 'Total Length (m)',
                              border: OutlineInputBorder(),
                              suffixText: 'm',
                            ),
                            onChanged: (_) => _recalculate(),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _riseController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              labelText: 'Arch Rise (m)',
                              hintText: 'Auto (~20%)',
                              border: OutlineInputBorder(),
                              suffixText: 'm',
                            ),
                            onChanged: (_) => _recalculate(),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DropdownButtonFormField<double>(
                            initialValue: _thickness,
                            decoration: const InputDecoration(
                              labelText: 'Sheet Gauge',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            ),
                            items: const [
                              DropdownMenuItem(value: 0.6, child: Text('0.60 mm (Std)')),
                              DropdownMenuItem(value: 0.8, child: Text('0.80 mm (Heavy)')),
                              DropdownMenuItem(value: 1.0, child: Text('1.00 mm (X-Heavy)')),
                            ],
                            onChanged: (val) {
                              if (val != null) {
                                setState(() => _thickness = val);
                                _recalculate();
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // ── RESULT SPECIFICATION CARD ──
            if (_result != null) ...[
              Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryDark, AppColors.primaryNavy],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4)),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Estimated Project Value',
                          style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.accentGold.withValues(alpha: 0.2),
                            border: Border.all(color: AppColors.accentGold),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('PRO ESTIMATE', style: TextStyle(color: AppColors.accentGold, fontSize: 10, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _currencyFormat.format(_result!.estimatedCost),
                      style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Rate approx ₹ 245 / sq.ft incl. profile curving & installation',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 11),
                    ),
                    const Divider(color: Colors.white24, height: 28),

                    // Metrics Grid
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildMetricCol('Arc Length', '${_result!.arcLength.toStringAsFixed(2)} m'),
                        _buildMetricCol('Roof Area', '${_result!.roofAreaSqFt.toStringAsFixed(0)} sq.ft'),
                        _buildMetricCol('Steel Weight', '${(_result!.estimatedSteelWeightKg / 1000).toStringAsFixed(2)} Ton'),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              Card(
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
                      const Text('Consultation Quick Points for Client:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      const SizedBox(height: 8),
                      _buildBullet('100% Truss-Less design ensures zero bird nuisance and zero structural maintenance.'),
                      _buildBullet('Self-supported curved arch allows 100% usable internal volume for cranes and storage.'),
                      _buildBullet('Rapid on-site mechanical seaming: 1,000 sq.ft fabricated & erected per working day.'),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCol(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 11)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _buildBullet(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_outline, color: AppColors.success, size: 16),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary))),
        ],
      ),
    );
  }
}
