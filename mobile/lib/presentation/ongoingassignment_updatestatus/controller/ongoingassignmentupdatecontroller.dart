import 'package:get/get.dart';

class OngoingassignmentupdatestatusController extends GetxController {
  var selectststus = false.obs;

  SelecteStatusFun() {
    selectststus.value = !selectststus.value;
  }
}
