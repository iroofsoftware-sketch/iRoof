import 'package:get/get.dart';

class LoginController extends GetxController
{
  var showpassword = false.obs;
  togglepass(){
    showpassword.value = !showpassword.value;
  }

  var reemberme = false.obs;
  togglerememberme(){
    reemberme.value =! reemberme.value;
  }
}