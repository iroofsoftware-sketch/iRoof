import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart';
import 'package:iroofing/services/api_service.dart';

class OngoingScrrenController extends GetxController {
  var seeheading = true.obs;
  var search = true.obs;
  var indexval = (-1).obs;
  var showinnerdetails = false.obs;
  var isLoading = false.obs;
  var assignments = [].obs;
  var errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadOngoingAssignments();
  }

  seesearch() {
    search.value = !search.value;
  }

  void seedetailsfun(int index) {
    indexval.value = index;
    seeheading.value = false;
    showinnerdetails.value = false;
  }

  resetView() {
    indexval.value = -1;
    seeheading.value = true;
    showinnerdetails.value = false;
  }

  seinnerdetails() {
    showinnerdetails.value = !showinnerdetails.value;
  }

  Future<void> loadOngoingAssignments() async {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      final storage = FlutterSecureStorage();
      final siteVisitorId = await storage.read(key: 'user_id');
      if (siteVisitorId == null) return;
      final response = await ApiService.getMyWork(siteVisitorId);
      if (response.statusCode == 200) {
        final allWork = response.data['data'] ?? [];
        assignments.value = allWork.where((work) =>
          work['status'] != 'Finished' &&
          work['status'] != 'Project Rejected from Client'
        ).toList();
      }
    } catch (e) {
      errorMessage.value = 'Failed to load assignments';
    } finally {
      isLoading.value = false;
    }
  }
}
