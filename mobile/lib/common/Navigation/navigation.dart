import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Navi {
  /// Navigate to the specified screen and replace the current screen.
  static void toOff(Widget page, {Transition? transition,}) {
    Get.off(
      page,
      transition: transition ?? Transition.rightToLeft,
      duration: const Duration(milliseconds: 800),
    );
  }

  /// Navigate to the specified screen without replacing the current one.
  static void to(Widget page, {Transition? transition}) {
    Get.to(
      page,
      transition: transition ?? Transition.rightToLeft,
      duration: const Duration(milliseconds: 800),
    );
  }

  /// Navigate to the specified screen and clear the navigation stack.
  static void offAll(Widget page, {Transition? transition}) {
    Get.offAll(
      page,
      transition: transition ?? Transition.rightToLeft,
      duration: const Duration(milliseconds: 800),
    );
  }

  /// Navigate back to the previous screen.
  static void back() {
    if (Get.isDialogOpen == true) {
      Get.back(); // Closes the dialog if open
    } else if (Get.isSnackbarOpen == true) {
      Get.close(1); // Closes the snackbar
    } else {
      Get.back(); // Default back navigation
    }
  }
}
