import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:iroofing/presentation/createnewpassword/ui/CreatenewpasswordScreen.dart';
import 'package:iroofing/services/api_service.dart';

class EnterOTPController extends GetxController {
  var isLoading = false.obs;

  Future<void> verifyOtp(String email, String otp) async {
    if (otp.isEmpty) {
      Fluttertoast.showToast(
        msg: "Please enter the OTP",
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    isLoading.value = true;
    try {
      final response = await ApiService.verifyOtp(email, otp);
      if (response.statusCode == 200) {
        Fluttertoast.showToast(
          msg: "OTP verified successfully",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        Get.off(() => const Createnewpasswordscreen(), arguments: email);
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: "Invalid OTP. Please try again.",
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }
}