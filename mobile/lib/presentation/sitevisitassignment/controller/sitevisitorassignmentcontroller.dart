import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart';
import 'package:iroofing/services/api_service.dart';

class SitevisitorAssignmetController extends GetxController {
  var seeheading = true.obs;
  var isLoading = false.obs;
  var assignments = [].obs;
  var errorMessage = ''.obs;
  String? siteVisitorId;

  @override
  void onInit() {
    super.onInit();
    loadAssignments();
  }

  Future<void> loadAssignments() async {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      final storage = FlutterSecureStorage();
      siteVisitorId = await storage.read(key: 'user_id');
      if (siteVisitorId == null) return;

      final response = await ApiService.getMyWork(siteVisitorId!);
      if (response.statusCode == 200) {
        assignments.value = response.data['data'] ?? [];
      }
    } catch (e) {
      errorMessage.value = 'Failed to load assignments';
    } finally {
      isLoading.value = false;
    }
  }
}