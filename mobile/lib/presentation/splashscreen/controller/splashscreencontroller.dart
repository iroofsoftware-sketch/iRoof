import 'package:get/get.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/common/bottomsheet/ui/botttomsheet.dart';
import 'package:iroofing/presentation/login/ui/loginpage.dart';
import 'package:iroofing/services/api_service.dart';

class SplashscreenController extends GetxController {
  @override
  void onInit() {
    super.onInit();
    checkLoginStatus();
  }

  Future<void> checkLoginStatus() async {
    await Future.delayed(Duration(seconds: 2));
    final isLoggedIn = await ApiService.isLoggedIn();
    if (isLoggedIn) {
      Navi.toOff(Bottomsheetnavigation());
    } else {
      Navi.toOff(Loginpage());
    }
  }
}
