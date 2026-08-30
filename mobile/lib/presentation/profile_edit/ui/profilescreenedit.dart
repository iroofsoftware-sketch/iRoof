import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/alertbox/alerbox1.dart';
import 'package:iroofing/common/bottomsheet/ui/botttomsheet.dart';
import 'package:iroofing/common/common_textbutton/commontext_button.dart';
import 'package:iroofing/common/common_textfield/common_textfield.dart';
import 'package:iroofing/common/elevted_button/ElevatedButton.dart';
import 'package:iroofing/common/text/textdata.dart';

import '../../../common/Color/Colordata.dart';
import '../../../common/Navigation/navigation.dart';

import '../../../main.dart';
import '../../Notification/ui/notificationscreen.dart';

class ProfilescreenEdit extends StatelessWidget {
  ProfilescreenEdit({super.key});

  var name = TextEditingController();
  var email = TextEditingController();
  var phone = TextEditingController();
  var pass = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
          Navi.to(Bottomsheetnavigation(pos: 3,),
              transition: Transition.leftToRight);
      },
      child: Scaffold(
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
                ))
          ],
        ),
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  children: [
                    IconButton(
                      onPressed: () {
                        Navi.to(Bottomsheetnavigation(pos: 3,),
                            transition: Transition.leftToRight);
                      },
                      icon: Icon(Icons.arrow_back_ios),
                    ),
                  ],
                ),
                Material(
                  elevation: 10,
                  borderRadius: BorderRadius.circular(15),
                  child: Container(
                    decoration: BoxDecoration(
                        color: ColorData.whitecolor,
                        borderRadius: BorderRadius.circular(10)),
                    child: Column(
                      children: [
                        SizedBox(
                          height: MyApp.height * .02,
                        ),
                        Stack(
                          children: [
                            Material(
                              shape: CircleBorder(
                                side: BorderSide(
                                  color: ColorData.whitecolor,
                                  width: MyApp.width * 0.008,
                                ),
                              ),
                              elevation: 5, // Softer shadow
                              child: CircleAvatar(
                                radius: MyApp.width * 0.15,
                                // Simplified radius calculation
                                backgroundImage:
                                    AssetImage('assets/profileimg.png'),
                              ),
                            ),
                            // Positioned Edit Icon
                            Positioned(
                              right: 0,
                              bottom: 0,
                              child: GestureDetector(
                                onTap: () {
                                  // Handle edit button press
                                },
                                child: Material(
                                  shape: CircleBorder(),
                                  color: ColorData.maincolor,
                                  // Background color for edit button
                                  child: Padding(
                                    padding: const EdgeInsets.all(4.0),
                                    // Add padding around the icon
                                    child: Icon(
                                      Icons.edit,
                                      color: ColorData.whitecolor,
                                      size: 16, // Adjust icon size
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(
                          height: MyApp.height * .05,
                        ),
                        ListTile(
                          leading: Image.asset("assets/profilecover.jpg"),
                          title: TextThemedel(text: "cover image"),
                          trailing: IconButton(onPressed: () {}, icon: Icon(Icons.edit)),
                        ),
                        SizedBox(
                          height: MyApp.height * .05,
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(
                  height: MyApp.height * .02,
                ),
                Material(
                  color: ColorData.whitecolor,
                  elevation: 10,
                  borderRadius: BorderRadius.circular(5),
                  child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 10),
                      child: Column(
                        children: [
                          SizedBox(
                            height: MyApp.height * .02,
                          ),
                          Row(
                            children: [
                              TextThemedel(
                                text: "name       ",
                                fontWeight: FontWeight.w300,
                                fontSize: 15,
                              ),
                            ],
                          ),
                          CommonTextField(
                            controller: name,
                            fillcolor: ColorData.bgcolor,
                            contentpadding: 10,
                            border: 5,
                            enableborder: 5,
                            focusborder: 5,
                            labelstyle: TextStyle(
                                color: ColorData.textfieldunfocuscolor),
                          ),
                          SizedBox(
                            height: MyApp.height * .02,
                          ),
                          Row(
                            children: [
                              TextThemedel(
                                text: "Email id   ",
                                fontWeight: FontWeight.w300,
                                fontSize: 15,
                              ),
                            ],
                          ),
                          CommonTextField(
                            controller: email,
                            fillcolor: ColorData.bgcolor,
                            contentpadding: 10,
                            border: 5,
                            enableborder: 5,
                            focusborder: 5,
                            labelstyle: TextStyle(
                                color: ColorData.textfieldunfocuscolor),
                          ),
                          SizedBox(
                            height: MyApp.height * .02,
                          ),
                          Row(
                            children: [
                              TextThemedel(
                                text: "Phone no  ",
                                fontWeight: FontWeight.w300,
                                fontSize: 15,
                              ),
                            ],
                          ),
                          CommonTextField(
                            controller: phone,
                            fillcolor: ColorData.bgcolor,
                            contentpadding: 10,
                            border: 5,
                            enableborder: 5,
                            focusborder: 5,
                            labelstyle: TextStyle(
                                color: ColorData.textfieldunfocuscolor),
                          ),
                          SizedBox(
                            height: MyApp.height * .02,
                          ),
                          Row(
                            children: [
                              TextThemedel(
                                text: "Password  ",
                                fontWeight: FontWeight.w300,
                                fontSize: 15,
                              ),
                            ],
                          ),
                          CommonTextField(
                            controller: pass,
                            fillcolor: ColorData.bgcolor,
                            contentpadding: 10,
                            border: 5,
                            enableborder: 5,
                            focusborder: 5,
                            labelstyle: TextStyle(
                                color: ColorData.textfieldunfocuscolor),
                          ),
                          SizedBox(
                            height: MyApp.height * .02,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CommonMaterialButton(
                                padding:
                                EdgeInsets.symmetric(horizontal: 30),
                                child: TextThemedel(
                                  text: "Save",
                                  color: ColorData.whitecolor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                                color: ColorData.maincolor,
                                onPressed: () {
                                  Navi.toOff(Bottomsheetnavigation());
                                  Fluttertoast.showToast(
                                    msg: "Profile Edited",
                                    toastLength:
                                    Toast.LENGTH_SHORT,
                                    gravity:
                                    ToastGravity.BOTTOM,
                                    timeInSecForIosWeb: 1,
                                  );
                                },
                                elevation: 20,
                              ),
                              SizedBox(
                                width: MyApp.width * .1,
                              ),
                              CommonMaterialButton(
                                elevation: 20,
                                padding:
                                EdgeInsets.symmetric(horizontal: 30),
                                color: ColorData.whitecolor,
                                child: TextThemedel(
                                  text: "Cancel",
                                  color: ColorData.maincolor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (context) => CustomAlertBox(
                                      title: "Alert",
                                      message:
                                      "Do you want to cancel edit?",
                                      button: [
                                        CommonTextButton(
                                          onPressed: () {
                                            Get.back();
                                          },
                                          icon: Icon(Icons.close),
                                          child: TextThemedel(text: "no"),
                                        ),
                                        CommonTextButton(
                                          onPressed: () {
                                            Get.back();
                                          },
                                          icon: Icon(Icons.check),
                                          child: TextThemedel(text: "yes"),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                          SizedBox(
                            height: MyApp.height * .05,
                          ),
                        ],
                      ),
                    ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
