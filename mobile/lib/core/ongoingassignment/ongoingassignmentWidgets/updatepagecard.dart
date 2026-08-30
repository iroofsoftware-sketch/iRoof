import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../common/Color/Colordata.dart';
import '../../../common/text/textdata.dart';
import '../ongoingassignmentWidgetsController/updatepagecardcontroller.dart';

class Updatepagecard extends StatelessWidget {
  const Updatepagecard({
    super.key,
    required this.title,
    this.neededfortop,
  });

  final String title;
  final bool? neededfortop;

  @override
  Widget build(BuildContext context) {
    var controller = Get.find<UpdatepageCardController>();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 0, horizontal: 15),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 25),
        decoration: BoxDecoration(
          color: ColorData.ongoingcard,
          borderRadius: BorderRadius.circular(5),
          border: Border(
            left: BorderSide(color: Colors.grey, width: 1), // Left border
            right: BorderSide(color: Colors.grey, width: 1), // Right border
            bottom: BorderSide(color: Colors.grey, width: 1), // Bottom border
            top: neededfortop != true
                ? BorderSide.none
                : BorderSide(color: Colors.grey, width: 1),
          ),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Obx(() => GestureDetector(
                  onTap: () {
                    controller.selectCard(title);
                    print("Selected: $title"); // Prints the selected title
                  },
                  child: Icon(
                    controller.selectedCard.value == title
                        ? Icons.radio_button_checked
                        : Icons.radio_button_off,
                    color: ColorData.maincolor,
                  ),
                )),
                const SizedBox(width: 8), // Add spacing between icon and text
                TextThemedel(text: title),
                const Spacer(),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
