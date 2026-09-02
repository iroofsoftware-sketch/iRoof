import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/common/bottomsheet/ui/botttomsheet.dart';
import '../../../common/Color/Colordata.dart';

import '../../../main.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        // var controller = Get.put(BottomSheetcntroller());
        // controller
        //     .sitevisitorfun();
        Navi.to(Bottomsheetnavigation(pos: 1,),transition: Transition.leftToRight);
      },
      child: Scaffold(
        backgroundColor: ColorData.bgcolor,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: ColorData.maincolor,
          title: Row(
            children: [
              Image.asset(
                "assets/logo.png",
                height: MyApp.height * 0.05,
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {
                 //  var controller = Get.put(BottomSheetcntroller());
                 // controller.sitevisitorfun();
                  Navi.to(Bottomsheetnavigation(),transition: Transition.leftToRight);
                  Fluttertoast.showToast(
                    msg: "Notification cleared",
                    toastLength: Toast.LENGTH_SHORT,
                    gravity: ToastGravity.BOTTOM,
                  );
                },
                child: const Text(
                  "Clear notifications",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        body: Column(
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () {
                    // var controller = Get.put(BottomSheetcntroller());
                    // controller
                    //     .sitevisitorfun();
                    Navi.to(Bottomsheetnavigation(),transition: Transition.leftToRight);
                  },
                  icon: Icon(Icons.arrow_back_ios),
                ),
              ],
            ),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.notifications_none,
                      size: 80,
                      color: Colors.grey[300],
                    ),
                    SizedBox(height: 16),
                    Text(
                      "No notifications yet",
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.grey[500],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      "You will see notifications here when they arrive",
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[400],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
