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
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 5, // Example with 5 notifications
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: ColorData.whitecolor,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            offset: const Offset(0, 4),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: ColorData.textbluecolor.withOpacity(0.1),
                            child: Icon(
                              Icons.notifications,
                              color: ColorData.maincolor,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Notification Title ${index + 1}",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: ColorData.textblackcolor,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "This is a description of the notification. It provides additional details about the alert.",
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: ColorData.textfieldunfocuscolor,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "Just now",
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: ColorData.textfieldunfocuscolor,
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () {
                                        // Handle dismissal of notification
                                      },
                                      child: Text(
                                        "Dismiss",
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: ColorData.cancelbuttoncolor,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
