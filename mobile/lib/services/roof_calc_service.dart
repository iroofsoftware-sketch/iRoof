import 'dart:math';

class RoofCalculationResult {
  final double span;
  final double length;
  final double rise;
  final double thickness;
  final double arcLength;
  final double radius;
  final double roofAreaSqM;
  final double roofAreaSqFt;
  final double estimatedSteelWeightKg;
  final double estimatedCost;
  final String modelName;

  RoofCalculationResult({
    required this.span,
    required this.length,
    required this.rise,
    required this.thickness,
    required this.arcLength,
    required this.radius,
    required this.roofAreaSqM,
    required this.roofAreaSqFt,
    required this.estimatedSteelWeightKg,
    required this.estimatedCost,
    required this.modelName,
  });
}

class RoofCalcService {
  static RoofCalculationResult calculate({
    required double span,
    required double length,
    double? rise,
    double thickness = 0.6,
    double baseRatePerSqFt = 245.0,
    String modelName = 'Standard Curved Arch',
  }) {
    if (span <= 0) span = 18.0;
    if (length <= 0) length = 30.0;
    
    // Standard rise recommendation is 20% of span if not provided
    final effectiveRise = (rise != null && rise > 0) ? rise : (span * 0.20);

    // Circle radius: R = (S^2 / 8H) + (H / 2)
    final radius = (pow(span, 2) / (8 * effectiveRise)) + (effectiveRise / 2);

    // Half angle theta = arcsin( (S/2) / R )
    final halfSpan = span / 2;
    final ratio = (halfSpan / radius).clamp(-1.0, 1.0);
    final theta = asin(ratio);

    // Arc length = 2 * R * theta
    final arcLength = 2 * radius * theta;

    // Roof Area
    final roofAreaSqM = arcLength * length;
    final roofAreaSqFt = roofAreaSqM * 10.7639;

    // Estimated Steel weight: area * thickness (mm) * 7.85 kg/m2/mm * profile girth factor (~1.34)
    final profileGirthFactor = 1.34;
    final steelWeightKg = roofAreaSqM * thickness * 7.85 * profileGirthFactor;

    // Estimated commercial project cost
    final estimatedCost = roofAreaSqFt * baseRatePerSqFt;

    return RoofCalculationResult(
      span: span,
      length: length,
      rise: effectiveRise,
      thickness: thickness,
      arcLength: arcLength,
      radius: radius,
      roofAreaSqM: roofAreaSqM,
      roofAreaSqFt: roofAreaSqFt,
      estimatedSteelWeightKg: steelWeightKg,
      estimatedCost: estimatedCost,
      modelName: modelName,
    );
  }
}
