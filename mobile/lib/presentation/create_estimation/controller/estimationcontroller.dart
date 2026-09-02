import 'package:get/get.dart';
import 'package:iroofing/services/api_service.dart';

class EstimationController extends GetxController {
  var showmeasurment = false.obs;
  var showestimatecard = false.obs;
  var selectedIndex = (-1).obs;
  var isLoading = false.obs;
  var projectTypes = [].obs;
  var roofModels = [].obs;
  var selectedProjectType = ''.obs;
  var selectedRoofModel = ''.obs;
  var selectedPreference = ''.obs;
  final options = ["Car Porch", "Auditorium"];

  @override
  void onInit() {
    super.onInit();
    loadProjectTypes();
  }

  togglemeasurmentvalue() {
    showmeasurment.value = !showmeasurment.value;
    if (showestimatecard.value == true) {
      showestimatecard.value = false;
    }
  }

  toggleestimtecard() {
    showestimatecard.value = !showestimatecard.value;
  }

  Future<void> loadProjectTypes() async {
    isLoading.value = true;
    try {
      final response = await ApiService.getAllProjectTypes();
      if (response.statusCode == 200) {
        projectTypes.value = response.data['projectTypes'] ?? response.data ?? [];
      }
    } catch (e) {
      print('Error loading project types: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadRoofModels(String projectTypeId) async {
    try {
      final response = await ApiService.getAllCategories();
      if (response.statusCode == 200) {
        final all = response.data['categories'] ?? response.data ?? [];
        roofModels.value = all.where((m) => m['projectTypeId'] == projectTypeId).toList();
      }
    } catch (e) {
      print('Error loading roof models: $e');
    }
  }
}