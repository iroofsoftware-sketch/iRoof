import 'package:get/get.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/presentation/login/ui/loginpage.dart';

class SplashscreenController extends GetxController {
  switchfromsplahscreen() async {
    Future.delayed(
      Duration(seconds: 2),
      () {
        Navi.toOff(Loginpage());
      },
    );
  }

  @override
  void onInit() {
    switchfromsplahscreen();
    // TODO: implement onInit
    super.onInit();
  }
}
