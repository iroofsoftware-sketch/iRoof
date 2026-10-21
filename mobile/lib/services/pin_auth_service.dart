import 'package:shared_preferences/shared_preferences.dart';

class PinAuthService {
  static const String prefPinKey = 'iroof_security_pin';
  static const String prefPinEnabledKey = 'iroof_pin_enabled';

  static String? _memPin;
  static bool? _memPinEnabled;

  static Future<bool> isPinEnabled() async {
    if (_memPinEnabled != null) return _memPinEnabled!;
    try {
      final prefs = await SharedPreferences.getInstance();
      _memPinEnabled = prefs.getBool(prefPinEnabledKey) ?? false;
      return _memPinEnabled!;
    } catch (_) {
      return false;
    }
  }

  static Future<void> setSecurityPin(String pin) async {
    _memPin = pin;
    _memPinEnabled = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(prefPinKey, pin);
      await prefs.setBool(prefPinEnabledKey, true);
    } catch (_) {}
  }

  static Future<bool> verifyPin(String enteredPin) async {
    if (_memPin != null) {
      return _memPin == enteredPin;
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      final stored = prefs.getString(prefPinKey);
      return stored == enteredPin;
    } catch (_) {
      return enteredPin == '1234'; // Default demo backup pin
    }
  }

  static Future<void> disablePin() async {
    _memPin = null;
    _memPinEnabled = false;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(prefPinKey);
      await prefs.setBool(prefPinEnabledKey, false);
    } catch (_) {}
  }
}
