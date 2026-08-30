import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:iroofing/services/api_service.dart';
import 'package:iroofing/presentation/login/ui/loginpage.dart';

class CreateNewPasswordController extends GetxController {
  var showpassword = false.obs;
  var isLoading = false.obs;

  toggleshowpassword() {
    showpassword.value = !showpassword.value;
  }

  Future<void> resetPassword(String email, String password, String confirmPassword) async {
    if (password.isEmpty || confirmPassword.isEmpty) {
      Fluttertoast.showToast(
        msg: "Please fill in all fields",
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    if (password != confirmPassword) {
      Fluttertoast.showToast(
        msg: "Passwords do not match",
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    if (password.length < 6) {
      Fluttertoast.showToast(
        msg: "Password must be at least 6 characters",
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    isLoading.value = true;
    try {
      final response = await ApiService.resetPassword(email, password);
      if (response.statusCode == 200) {
        Fluttertoast.showToast(
          msg: "Password reset successfully. Please login.",
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.BOTTOM,
        );
        Get.offAll(() => Loginpage());
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: "Failed to reset password. Please try again.",
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }
}