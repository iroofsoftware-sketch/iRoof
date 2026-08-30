import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:iroofing/services/api_service.dart';
import 'package:iroofing/common/bottomsheet/ui/botttomsheet.dart';

class LoginController extends GetxController {
  var showpassword = false.obs;
  var rememberme = false.obs;
  var isLoading = false.obs;
  String? userId;

  togglepass() {
    showpassword.value = !showpassword.value;
  }

  togglerememberme() {
    rememberme.value = !rememberme.value;
  }

  Future<void> login(String email, String password) async {
    if (email.isEmpty || password.isEmpty) {
      Fluttertoast.showToast(
        msg: "Please enter email and password",
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
      );
      return;
    }

    isLoading.value = true;

    try {
      final response = await ApiService.login(email, password);

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final user = data['user'];

        if (token != null) {
          await ApiService.saveToken(token);
          userId = user['_id'];

          Fluttertoast.showToast(
            msg: "Login Successful",
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM,
          );

          Get.offAll(() => Bottomsheetnavigation());
        }
      }
    } catch (e) {
      Fluttertoast.showToast(
        msg: "Invalid email or password",
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }
}