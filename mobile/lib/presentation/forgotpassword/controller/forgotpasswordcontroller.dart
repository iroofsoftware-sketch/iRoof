import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:iroofing/presentation/enterotp/ui/enterotp_screen.dart';
import 'package:iroofing/services/api_service.dart';

class ForgotpasswordController extends GetxController {
  var isLoading = false.obs;

  Future<void> sendOtp(String email) async {
    if (email.isEmpty) {
      Fluttertoast.showToast(
        msg: "Please enter your email",
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    isLoading.value = true;
    try {
      final response = await ApiService.requestOtp(email);
      if (response.statusCode == 200) {
        Fluttertoast.showToast(
          msg: "OTP sent to your email",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
        );
        Get.off(() => EnterotpScreen(email: email));
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: "Failed to send OTP. Check your email and try again.",
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }
}