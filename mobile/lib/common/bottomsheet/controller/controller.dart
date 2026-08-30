import 'package:circular_bottom_navigation/circular_bottom_navigation.dart';
import 'package:circular_bottom_navigation/tab_item.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Color/Colordata.dart';

class NavigationController extends GetxController {
  final int? pos;

  late CircularBottomNavigationController navigationController;

  var selectedPos = 0.obs;

  List<TabItem> tabItems = List.of([
    TabItem(
      Icons.home,
      "home",
      ColorData.maincolor,
      labelStyle: TextStyle(
        fontWeight: FontWeight.normal,
      ),
    ),
    TabItem(
      Icons.add_home_work,
      "ongoing",
      ColorData.maincolor,
      labelStyle: TextStyle(
        fontWeight: FontWeight.normal,
      ),
    ),
    TabItem(
      Icons.maps_home_work_rounded,
      "site visitor",
      ColorData.maincolor,
      labelStyle: TextStyle(
        fontWeight: FontWeight.normal,
      ),
    ),
    TabItem(
      Icons.person,
      "profile",
      ColorData.maincolor,
      labelStyle: TextStyle(
        fontWeight: FontWeight.normal,
      ),
    ),
  ]);

  NavigationController({this.pos});

  @override
  void onInit() {
    navigationController = CircularBottomNavigationController(pos ?? 0);
    selectedPos.value = pos ?? 0;
    super.onInit();
  }

  void updateSelectedPos(int index) {
    selectedPos.value = index;
    navigationController.value = index;
  }

  @override
  void onClose() {
    navigationController.dispose();
    super.onClose();
  }
}
