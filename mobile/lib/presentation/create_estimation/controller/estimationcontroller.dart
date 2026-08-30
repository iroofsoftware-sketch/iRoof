import 'package:get/get.dart';

class EstimationController extends GetxController{
  var showmeasurment = false.obs;

  togglemeasurmentvalue() {
    showmeasurment.value = !showmeasurment.value;
    if(showestimatecard.value==true)
    {
      showestimatecard.value = false;
    }
    print("showestimatecard.value : ${showestimatecard.value}");
    print("showing measurement :${showmeasurment.value}");
  }


  var showestimatecard = false.obs;

  toggleestimtecard() {
    showestimatecard.value = !showestimatecard.value;
    print("showestimatecard.value : ${showestimatecard.value}");
  }

  /// options
  var selectedIndex = (-1).obs;

  // List of dropdown options
  final options = ["Car Porch", "Auditorium"];
}