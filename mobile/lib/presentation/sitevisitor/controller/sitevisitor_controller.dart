import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart';
import 'package:iroofing/services/api_service.dart';

class SiteVisitorController extends GetxController {
  var isLoading = false.obs;
  var userName = ''.obs;
  var userId = ''.obs;
  var assignments = [].obs;

  @override
  void onInit() {
    super.onInit();
    loadData();
  }

  Future<void> loadData() async {
    isLoading.value = true;
    try {
      final storage = FlutterSecureStorage();
      final id = await storage.read(key: 'user_id');
      if (id == null) return;
      userId.value = id;

      final profileResponse = await ApiService.getUserById(id);
      if (profileResponse.statusCode == 200) {
        userName.value = profileResponse.data['name'] ?? '';
      }

      final workResponse = await ApiService.getMyWork(id);
      if (workResponse.statusCode == 200) {
        assignments.value = workResponse.data['data'] ?? [];
      }
    } catch (e) {
      print('SiteVisitor load error: $e');
    } finally {
      isLoading.value = false;
    }
  }
}