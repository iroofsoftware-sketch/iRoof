import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart';
import 'package:iroofing/services/api_service.dart';

class ProfileController extends GetxController {
  var isLoading = false.obs;
  var name = ''.obs;
  var email = ''.obs;
  var phone = ''.obs;
  var designation = ''.obs;
  var location = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadProfile();
  }

  Future<void> loadProfile() async {
    isLoading.value = true;
    try {
      final storage = FlutterSecureStorage();
      final userId = await storage.read(key: 'user_id');
      if (userId == null) return;
      final response = await ApiService.getUserById(userId);
      if (response.statusCode == 200) {
        final user = response.data;
        name.value = user['name'] ?? '';
        email.value = user['mailId'] ?? '';
        phone.value = user['mobileNumber'] ?? '';
        designation.value = user['designations'] ?? '';
        location.value = user['location'] ?? '';
      }
    } catch (e) {
      print('Profile load error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    await ApiService.logout();
  }
}