import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/bottomsheet/ui/botttomsheet.dart';
import 'package:iroofing/services/api_service.dart';

class ProfileEditController extends GetxController {
  var isLoading = false.obs;

  Future<void> saveProfile(String name, String email, String phone) async {
    if (name.isEmpty && email.isEmpty && phone.isEmpty) {
      Fluttertoast.showToast(
        msg: "Please fill in at least one field",
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    isLoading.value = true;
    try {
      final storage = FlutterSecureStorage();
      final userId = await storage.read(key: 'user_id');
      if (userId == null) return;

      final Map<String, dynamic> updateData = {};
      if (name.isNotEmpty) updateData['name'] = name;
      if (email.isNotEmpty) updateData['mailId'] = email;
      if (phone.isNotEmpty) updateData['mobileNumber'] = phone;

      final response = await ApiService.updateProfile(userId, updateData);
      if (response.statusCode == 200) {
        Fluttertoast.showToast(
          msg: "Profile updated successfully",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        Get.offAll(() => Bottomsheetnavigation(pos: 3));
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: "Failed to update profile. Please try again.",
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }
}