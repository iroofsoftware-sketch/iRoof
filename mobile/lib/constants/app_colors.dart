import 'package:flutter/material.dart';

class AppColors {
  // Brand Primary & Navy
  static const Color primaryDark = Color(0xFF06142A);
  static const Color primaryNavy = Color(0xFF0B2E59);
  static const Color primaryNavyLight = Color(0xFF133E75);
  static const Color primaryNavySurface = Color(0xFFEBF2FA);
  
  // Architectural Gold Accent
  static const Color accentGold = Color(0xFFC9940A);
  static const Color accentGoldLight = Color(0xFFE5AA17);
  static const Color accentGoldMuted = Color(0xFFFBF6E9);
  
  // Surfaces & Backgrounds
  static const Color background = Color(0xFFF8FAFC);
  static const Color backgroundAlt = Color(0xFFF1F5F9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSubtle = Color(0xFFFBFDFF);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderLight = Color(0xFFEEF2F6);
  
  // Typography Hierarchy
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color textLight = Color(0xFFCBD5E1);

  // Status & Semantic Colors
  static const Color success = Color(0xFF15803D);
  static const Color successGreen = Color(0xFF10B981);
  static const Color successLight = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFD97706);
  static const Color warningLight = Color(0xFFFFFBEB);
  static const Color danger = Color(0xFFDC2626);
  static const Color dangerLight = Color(0xFFFEF2F2);
  static const Color info = Color(0xFF0284C7);
  static const Color infoLight = Color(0xFFF0F9FF);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryNavy, primaryNavyLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkCardGradient = LinearGradient(
    colors: [Color(0xFF081A36), Color(0xFF0B2E59)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [accentGold, accentGoldLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Soft Ambient Shadows
  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x080F172A),
      blurRadius: 16,
      offset: Offset(0, 4),
      spreadRadius: 0,
    ),
  ];

  static const List<BoxShadow> floatingShadow = [
    BoxShadow(
      color: Color(0x140B2E59),
      blurRadius: 24,
      offset: Offset(0, 8),
      spreadRadius: 0,
    ),
  ];
}
