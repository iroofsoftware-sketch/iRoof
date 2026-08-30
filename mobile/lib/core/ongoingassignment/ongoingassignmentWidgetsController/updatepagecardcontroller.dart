import 'package:get/get.dart';

class UpdatepageCardController extends GetxController {
  var selectedCard = "".obs; // Holds the currently selected card's title

  void selectCard(String title) {
    selectedCard.value = title; // Updates the selected card
  }
}
