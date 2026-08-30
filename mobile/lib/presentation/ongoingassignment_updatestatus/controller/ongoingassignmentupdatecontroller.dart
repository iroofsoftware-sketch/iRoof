import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:iroofing/services/api_service.dart';

class OngoingassignmentupdatestatusController extends GetxController {
  var selectststus = false.obs;
  var isLoading = false.obs;
  String? estimateId;

  SelecteStatusFun() {
    selectststus.value = !selectststus.value;
  }

  Future<void> updateStatus(String selectedStatus) async {
    if (estimateId == null) {
      Fluttertoast.showToast(
        msg: "No estimate selected",
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    isLoading.value = true;
    try {
      final response = await ApiService.updateEstimateStatus(
        estimateId!,
        selectedStatus,
      );

      if (response.statusCode == 200) {
        Fluttertoast.showToast(
          msg: "Status updated successfully",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        Get.back();
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: "Failed to update status",
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }
}
