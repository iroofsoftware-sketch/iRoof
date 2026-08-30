import 'package:get/get.dart';

class OngoingScrrenController extends GetxController {
  var seeheading = true.obs;
  var search = true.obs;
  var indexval = (-1).obs; // Default to a value outside the valid range
  var showinnerdetails = false.obs;

  seesearch(){
    search.value = !search.value;
  }

  void seedetailsfun(int index) {
    indexval.value = index; // Update indexval to the clicked card index
    seeheading.value = false; // Hide the heading
    showinnerdetails.value = false;
  }

  resetView() {
    indexval.value = -1; // Reset indexval to default
    seeheading.value = true; // Show the heading again
    showinnerdetails.value = false;
  }

  seinnerdetails() {
    showinnerdetails.value = !showinnerdetails.value;
  }
}
