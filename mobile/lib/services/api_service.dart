import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart' hide Response, FormData, MultipartFile;

class ApiService {
  static const String baseUrl = 'http://localhost:5000/iRoof';
  static const String tokenKey = 'jwt_token';

  static final FlutterSecureStorage _storage = FlutterSecureStorage();

  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 30),
      receiveTimeout: Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: tokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await logout();
        }
        return handler.next(error);
      },
    ));

    return dio;
  }

  // Save token after login
  static Future<void> saveToken(String token) async {
    await _storage.write(key: tokenKey, value: token);
  }

  // Get saved token
  static Future<String?> getToken() async {
    return await _storage.read(key: tokenKey);
  }

  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: tokenKey);
    return token != null;
  }

  // Logout — clear token and go to login
  static Future<void> logout() async {
    await _storage.delete(key: tokenKey);
    Get.offAllNamed('/login');
  }

  // AUTH
  static Future<Response> login(String email, String password) async {
    return await _createDio().post('/auth/login', data: {
      'mailId': email,
      'password': password,
    });
  }

  static Future<Response> requestOtp(String email) async {
    return await _createDio().post('/auth/request-otp', data: {
      'mailId': email,
    });
  }

  static Future<Response> verifyOtp(String email, String otp) async {
    return await _createDio().post('/auth/verify-otp', data: {
      'mailId': email,
      'otp': otp,
    });
  }

  // SITE VISITOR
  static Future<Response> getMyWork(String siteVisitorId) async {
    return await _createDio().get('/siteVisitor/getMyWork/$siteVisitorId');
  }

  static Future<Response> updateEstimateStatus(String estimateId, String status) async {
    return await _createDio().put('/siteVisitor/updateStatus/$estimateId', data: {
      'status': status,
    });
  }

  static Future<Response> getEstimatesBySiteVisitorAndStatus(
      String siteVisitorId, String status) async {
    return await _createDio()
        .get('/siteVisitor/$siteVisitorId/estimateStatus/$status');
  }

  // PROFILE
  static Future<Response> getUserById(String userId) async {
    return await _createDio().get('/admin/profile/$userId');
  }

  static Future<Response> updateProfile(String userId, Map<String, dynamic> data) async {
    return await _createDio().put('/admin/profile/$userId', data: data);
  }

  // ESTIMATES
  static Future<Response> getAllEstimates() async {
    return await _createDio().get('/estimate/getAllEstimates');
  }

  static Future<Response> getEstimateById(String id) async {
    return await _createDio().get('/estimate/getestimate/$id');
  }

  // IMAGE UPLOAD
  static Future<Response> uploadSiteImage(String filePath, String estimateId) async {
    final formData = FormData.fromMap({
      'areaImages': await MultipartFile.fromFile(
        filePath,
        filename: filePath.split('/').last,
      ),
      'estimateId': estimateId,
    });

    return await _createDio().post(
      '/estimate/finalEstimate',
      data: formData,
      options: Options(
        headers: {'Content-Type': 'multipart/form-data'},
      ),
    );
  }

  // UPDATE PROFILE WITH IMAGE
  static Future<Response> uploadProfileImage(String filePath, String userId) async {
    final formData = FormData.fromMap({
      'profilePic': await MultipartFile.fromFile(
        filePath,
        filename: filePath.split('/').last,
      ),
    });

    return await _createDio().put(
      '/admin/profile/$userId',
      data: formData,
      options: Options(
        headers: {'Content-Type': 'multipart/form-data'},
      ),
    );
  }

  static Future<Response> resetPassword(String email, String newPassword) async {
    return await _createDio().post('/auth/reset-password', data: {
      'mailId': email,
      'newPassword': newPassword,
    });
  }
}
