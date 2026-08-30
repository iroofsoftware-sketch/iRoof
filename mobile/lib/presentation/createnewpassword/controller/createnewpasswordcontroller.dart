import 'package:get/get.dart';

class CreateNewPasswordController extends GetxController
{
  var showpassword = false.obs;
  toggleshowpassword(){
    showpassword.value = !showpassword.value;
  }
}