import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class ApiService {
  // Live backend URL — update this to your Render deployment URL
  static const String defaultUrl = 'https://iroof-backend.onrender.com/api';
  static const String prefBaseUrlKey = 'iroof_base_url';
  static const String prefUserKey = 'iroof_user_data';

  // In-memory fallback for SharedPreferences
  static final Map<String, String> _memoryStore = {};
  static final Map<String, dynamic> _cacheStore = {};

  // Session expiry listener callback
  static void Function()? onSessionExpired;

  static Future<String> getBaseUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance().timeout(
        const Duration(seconds: 1),
        onTimeout: () => throw Exception('Prefs timeout'),
      );
      return prefs.getString(prefBaseUrlKey) ?? _memoryStore[prefBaseUrlKey] ?? defaultUrl;
    } catch (_) {
      return _memoryStore[prefBaseUrlKey] ?? defaultUrl;
    }
  }

  static Future<void> setBaseUrl(String url) async {
    final cleaned = url.trim();
    _memoryStore[prefBaseUrlKey] = cleaned;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(prefBaseUrlKey, cleaned);
    } catch (_) {}
  }

  static Future<void> saveCurrentUser(UserModel user) async {
    final jsonStr = jsonEncode(user.toJson());
    _memoryStore[prefUserKey] = jsonStr;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(prefUserKey, jsonStr);
    } catch (_) {}
  }

  static Future<UserModel?> getCurrentUser() async {
    try {
      String? str = _memoryStore[prefUserKey];
      if (str == null) {
        final prefs = await SharedPreferences.getInstance().timeout(
          const Duration(seconds: 1),
          onTimeout: () => throw Exception('Prefs timeout'),
        );
        str = prefs.getString(prefUserKey);
      }
      if (str == null) return null;
      return UserModel.fromJson(jsonDecode(str));
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearCurrentUser() async {
    _memoryStore.remove(prefUserKey);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(prefUserKey);
    } catch (_) {}
  }

  // ── TEST CONNECTION ──
  static Future<bool> testConnection([String? testUrl]) async {
    final url = testUrl ?? await getBaseUrl();
    try {
      final base = url.endsWith('/api') ? url.replaceAll('/api', '') : url;
      final res = await http.get(Uri.parse('$base/api/health')).timeout(const Duration(seconds: 3));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ── AUTH LOGIN ──
  static Future<UserModel> login(String email, String password) async {
    final cleanEmail = email.toLowerCase().trim();
    final baseUrl = await getBaseUrl();

    final res = await http
        .post(
          Uri.parse('$baseUrl/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'email': cleanEmail, 'password': password.trim()}),
        )
        .timeout(const Duration(seconds: 10));

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true && data['user'] != null) {
        final user = UserModel.fromJson(data['user'], token: data['token']);
        await saveCurrentUser(user);
        return user;
      }
      throw Exception(data['message'] ?? 'Login failed');
    } else {
      final err = jsonDecode(res.body);
      throw Exception(err['message'] ?? 'Invalid credentials');
    }
  }

  // ── WORK ORDERS (GET ALL / FILTERED) ──
  static Future<List<Map<String, dynamic>>> getWorkOrders({String? status}) async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/work-orders'),
            headers: {
              if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['data'] is List) {
          final list = List<Map<String, dynamic>>.from(data['data']);
          _cacheStore['work_orders'] = list;
          return list;
        }
      } else if (res.statusCode == 401) {
        onSessionExpired?.call();
        throw Exception('Session expired. Please log in again.');
      }
      throw Exception('Failed to load work orders');
    } catch (e) {
      // Return cached data if available (brief network glitch recovery)
      if (_cacheStore['work_orders'] is List) {
        return List<Map<String, dynamic>>.from(_cacheStore['work_orders']);
      }
      rethrow;
    }
  }

  // ── WORK ORDER BY ID ──
  static Future<Map<String, dynamic>?> getWorkOrderById(String id) async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/work-orders/$id'),
            headers: {
              if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['data'] ?? data['workOrder'];
      }
    } catch (_) {
      // Try from in-memory cache
      if (_cacheStore['work_orders'] is List) {
        final all = List<Map<String, dynamic>>.from(_cacheStore['work_orders']);
        try {
          return all.firstWhere((w) => w['_id'] == id || w['id'] == id);
        } catch (_) {}
      }
    }
    return null;
  }

  // ── WORK ORDER STATS (PIPELINE & STAGE COUNTS) ──
  static Future<Map<String, dynamic>> getWorkOrderStats() async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/work-orders/stats'),
            headers: {
              if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
            },
          )
          .timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['data'] != null) {
          _cacheStore['work_order_stats'] = data['data'];
          return Map<String, dynamic>.from(data['data']);
        }
      }
    } catch (_) {
      if (_cacheStore['work_order_stats'] != null) {
        return Map<String, dynamic>.from(_cacheStore['work_order_stats']);
      }
    }

    return {
      'total': 0,
      'pending_accounts': 0,
      'pending_design': 0,
      'pending_pm_review': 0,
      'drawing_revision': 0,
      'pending_purchase': 0,
      'completed': 0,
    };
  }

  // ── PM REVIEW (APPROVE BOM / REQUEST REVISION) ──
  static Future<bool> pmReviewWorkOrder({
    required String workOrderId,
    required String decision, // 'approved' or 'revision_requested'
    String notes = '',
  }) async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    final res = await http
        .post(
          Uri.parse('$baseUrl/work-orders/$workOrderId/pm-review'),
          headers: {
            'Content-Type': 'application/json',
            if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
          },
          body: jsonEncode({
            'decision': decision,
            'notes': notes,
          }),
        )
        .timeout(const Duration(seconds: 10));

    if (res.statusCode == 200) return true;
    final err = jsonDecode(res.body);
    throw Exception(err['message'] ?? 'Review submission failed');
  }

  // ── SITE VISITS (ASSIGNED OR ALL) ──
  static Future<List<Map<String, dynamic>>> getSiteVisits({bool mineOnly = false}) async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();
    final endpoint = mineOnly ? '$baseUrl/site-visits/mine' : '$baseUrl/site-visits';

    try {
      final res = await http
          .get(
            Uri.parse(endpoint),
            headers: {
              if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['data'] is List) {
          final list = List<Map<String, dynamic>>.from(data['data']);
          _cacheStore['site_visits'] = list;
          return list;
        }
      } else if (res.statusCode == 401) {
        onSessionExpired?.call();
        throw Exception('Session expired. Please log in again.');
      }
      throw Exception('Failed to load site visits');
    } catch (e) {
      if (_cacheStore['site_visits'] is List) {
        return List<Map<String, dynamic>>.from(_cacheStore['site_visits']);
      }
      rethrow;
    }
  }

  // ── SUBMIT SITE INSPECTION REPORT & MARK COMPLETE ──
  static Future<bool> submitSiteInspectionReport({
    required String visitId,
    required String report,
    required String notes,
    required List<Map<String, dynamic>> photos,
    String status = 'completed',
    Map<String, dynamic>? extraMeasurements,
  }) async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    final res = await http
        .patch(
          Uri.parse('$baseUrl/site-visits/$visitId'),
          headers: {
            'Content-Type': 'application/json',
            if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
          },
          body: jsonEncode({
            'report': report,
            'notes': notes,
            'photos': photos,
            'status': status,
            'completedDate': DateTime.now().toIso8601String(),
            ...?extraMeasurements != null ? {'measurements': extraMeasurements} : null,
          }),
        )
        .timeout(const Duration(seconds: 10));

    if (res.statusCode == 200) return true;
    final err = jsonDecode(res.body);
    throw Exception(err['message'] ?? 'Failed to submit inspection report');
  }

  // ── SUBMIT SITE INSPECTION (FORM COMPATIBILITY ALIAS) ──
  static Future<bool> submitSiteInspection(Map<String, dynamic> data) async {
    return submitSiteInspectionReport(
      visitId: data['_id'] ?? data['id'] ?? '',
      report: data['report'] ?? 'Field Site Inspection Report',
      notes: data['notes'] ?? '',
      photos: [],
      extraMeasurements: data,
    );
  }

  // ── UPLOAD PHOTO (CAMERA / GALLERY) ──
  static Future<String?> uploadPhoto(XFile file) async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/upload'));
    if (user?.token != null) {
      request.headers['Authorization'] = 'Bearer ${user!.token}';
    }

    final bytes = await file.readAsBytes();
    final multipartFile = http.MultipartFile.fromBytes(
      'file',
      bytes,
      filename: file.name.isNotEmpty ? file.name : 'site_inspection_${DateTime.now().millisecondsSinceEpoch}.jpg',
    );
    request.files.add(multipartFile);

    final streamedResponse = await request.send().timeout(const Duration(seconds: 30));
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['data'] != null && data['data']['url'] != null) {
        final url = data['data']['url'] as String;
        final host = baseUrl.endsWith('/api') ? baseUrl.replaceAll('/api', '') : baseUrl;
        return url.startsWith('http') ? url : '$host$url';
      }
    }
    throw Exception('Photo upload failed: ${response.statusCode}');
  }

  // ── ENQUIRIES (ADMIN) ──
  static Future<List<Map<String, dynamic>>> getEnquiries() async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/enquiries'),
            headers: {
              if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['enquiries'] is List) {
          final list = List<Map<String, dynamic>>.from(data['enquiries']);
          _cacheStore['enquiries'] = list;
          return list;
        }
      } else if (res.statusCode == 401) {
        onSessionExpired?.call();
        throw Exception('Session expired. Please log in again.');
      }
      throw Exception('Failed to load enquiries');
    } catch (e) {
      if (_cacheStore['enquiries'] is List) {
        return List<Map<String, dynamic>>.from(_cacheStore['enquiries']);
      }
      rethrow;
    }
  }

  // ── USERS DIRECTORY (ADMIN) ──
  static Future<List<Map<String, dynamic>>> getUsers() async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/admin/users'),
            headers: {
              if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['users'] is List) {
          final list = List<Map<String, dynamic>>.from(data['users']);
          _cacheStore['users'] = list;
          return list;
        }
      } else if (res.statusCode == 401) {
        onSessionExpired?.call();
        throw Exception('Session expired. Please log in again.');
      }
      throw Exception('Failed to load users');
    } catch (e) {
      if (_cacheStore['users'] is List) {
        return List<Map<String, dynamic>>.from(_cacheStore['users']);
      }
      rethrow;
    }
  }

  // ── NOTIFICATIONS ──
  static Future<Map<String, dynamic>> getNotifications() async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();

    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/notifications'),
            headers: {
              if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
            },
          )
          .timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return {
          'unreadCount': data['unreadCount'] ?? 0,
          'notifications': data['data'] ?? [],
        };
      }
    } catch (_) {}

    return {
      'unreadCount': 0,
      'notifications': [],
    };
  }

  static Future<void> markNotificationRead(String id) async {
    final baseUrl = await getBaseUrl();
    final user = await getCurrentUser();
    try {
      await http.patch(
        Uri.parse('$baseUrl/notifications/$id/read'),
        headers: {
          if (user?.token != null) 'Authorization': 'Bearer ${user!.token}',
        },
      ).timeout(const Duration(seconds: 5));
    } catch (_) {}
  }

  // ── UPDATE PROFILE ──
  static Future<UserModel> updateProfile({
    required String name,
    required String email,
    String? phone,
    String? designation,
  }) async {
    final baseUrl = await getBaseUrl();
    final currentUser = await getCurrentUser();

    final payload = {
      'name': name.trim(),
      'email': email.trim(),
      if (phone != null) 'phone': phone.trim(),
      if (designation != null) 'designation': designation.trim(),
    };

    final res = await http.put(
      Uri.parse('$baseUrl/auth/profile'),
      headers: {
        'Content-Type': 'application/json',
        if (currentUser?.token != null) 'Authorization': 'Bearer ${currentUser!.token}',
      },
      body: jsonEncode(payload),
    ).timeout(const Duration(seconds: 10));

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final updatedUser = UserModel.fromJson(
        data['user'],
        token: currentUser?.token,
      );
      await saveCurrentUser(updatedUser);
      return updatedUser;
    } else {
      final err = jsonDecode(res.body);
      throw Exception(err['message'] ?? 'Failed to update profile');
    }
  }

  // ── CHANGE PASSWORD ──
  static Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final baseUrl = await getBaseUrl();
    final currentUser = await getCurrentUser();

    final res = await http.put(
      Uri.parse('$baseUrl/auth/change-password'),
      headers: {
        'Content-Type': 'application/json',
        if (currentUser?.token != null) 'Authorization': 'Bearer ${currentUser!.token}',
      },
      body: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }),
    ).timeout(const Duration(seconds: 10));

    if (res.statusCode == 200) {
      return true;
    } else {
      final err = jsonDecode(res.body);
      throw Exception(err['message'] ?? 'Failed to change password');
    }
  }
}
