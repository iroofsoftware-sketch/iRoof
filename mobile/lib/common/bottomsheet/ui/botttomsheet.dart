import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:circular_bottom_navigation/circular_bottom_navigation.dart';
import 'package:get/get.dart';
import '../../../../main.dart';
import '../../../../presentation/Notification/ui/notificationscreen.dart';
import '../../../../presentation/ongoingassignment/ui/ongoingassignmentscreen.dart';
import '../../../../presentation/profile/ui/profilescreen.dart';
import '../../../../presentation/sitevisitassignment/ui/sitevisitorassignment_screen.dart';
import '../../../../presentation/sitevisitor/ui/sitevisitor_screen.dart';
import '../../Color/Colordata.dart';
import '../../Navigation/navigation.dart';
import '../../text/textdata.dart';
import '../controller/controller.dart';

class Bottomsheetnavigation extends StatelessWidget {
  Bottomsheetnavigation({super.key, this.pos});
  final int? pos;

  final double bottomNavBarHeight = MyApp.height*.05;


  @override
  Widget build(BuildContext context) {
    final controller = Get.put(NavigationController(pos: pos??0));
    return Scaffold(
        backgroundColor: ColorData.bgcolor,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: ColorData.maincolor,
          title: Image.asset(
            "assets/logo.png",
            height: MyApp.height * .05,
          ),
          actions: [
            IconButton(
              onPressed: () {
                Navi.toOff(NotificationScreen());
              },
              icon: Badge(
                label: TextThemedel(text: "5"),
                child: Icon(
                  CupertinoIcons.bell_fill,
                  color: ColorData.whitecolor,
                ),
              ),
            )
          ],
        ),
      body: Stack(
        children: <Widget>[
          Obx(() => Padding(
            padding: EdgeInsets.only(bottom: bottomNavBarHeight),
            child: bodyContainer(controller.selectedPos.value),
          )),
          Align(alignment: Alignment.bottomCenter, child: Obx(() => CircularBottomNavigation(
            iconsSize: MyApp.height*.008*MyApp.width*.008,
            circleSize: MyApp.height*.01*MyApp.width*.015,
            controller.tabItems,
            controller: controller.navigationController,
            selectedPos: controller.selectedPos.value,
            barHeight: bottomNavBarHeight,
            barBackgroundColor: Colors.white,
            backgroundBoxShadow: <BoxShadow>[
              BoxShadow(color: Colors.black45, blurRadius: 10.0),
            ],
            animationDuration: Duration(milliseconds: 300),
            selectedCallback: (int? selectedPos) {
              if (selectedPos != null) {
                controller.updateSelectedPos(selectedPos);
              }
            },
          ))),
        ],
      ),
    );
  }

  Widget bodyContainer(int selectedPos) {
    switch (selectedPos) {
      case 0:
        return SitevisitorScreen();
      case 1:
        return Ongoingassignmentscreen();
      case 2:
        return SitevisitorassignmentScreen();
      case 3:
        return ProfileScreen();
      default:
        return SizedBox.shrink();
    }
  }
}
