import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/common/common_textfield/common_textfield.dart';
import 'package:iroofing/presentation/Notification/ui/notificationscreen.dart';
import 'package:iroofing/presentation/create_estimation/controller/estimationcontroller.dart';
import 'package:iroofing/presentation/create_estimation_imagepreview/ui/createestimateimagescreen.dart';

import '../../../common/Color/Colordata.dart';


import '../../../common/bottomsheet/ui/botttomsheet.dart';
import '../../../common/elevted_button/ElevatedButton.dart';
import '../../../common/text/textdata.dart';
import '../../../main.dart';

class Estimationscreen extends StatelessWidget {
  const Estimationscreen({super.key});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(EstimationController());
    var rooftype = TextEditingController();
    var roofmodel = TextEditingController();
    var roofpreference = TextEditingController();

    ///
    var span = TextEditingController();
    var length = TextEditingController();
    var height = TextEditingController();
    var totalsqft = TextEditingController();
    var Total_Rate = TextEditingController();
    return PopScope(
      onPopInvoked: (didPop) {
        Navi.to(Bottomsheetnavigation(pos: 1,),transition: Transition.leftToRight);
      },
      canPop: false,
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
                  label: TextThemedel(text: "0"),
                  child: Icon(
                    CupertinoIcons.bell_fill,
                    color: ColorData.whitecolor,
                  ),
                ))
          ],
        ),
        body: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: MyApp.width * .04),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: MyApp.height * .008,
              ),
              Row(
                children: [
                  IconButton(
                    onPressed: () {
                      Navi.to(Bottomsheetnavigation(),transition: Transition.leftToRight);
                    },
                    icon: Icon(Icons.arrow_back_ios),
                  ),
                  TextThemedel(
                    text: "Create Estimation",
                    color: ColorData.maincolor,
                    fontSize: 25,
                    fontWeight: FontWeight.bold,
                  ),
                  Spacer(),
                ],
              ),
              const Divider(),
              SizedBox(
                height: MyApp.height * .01,
              ),
              TextThemedel(
                text: "Work Type",
                color: ColorData.textblackcolor,
                fontWeight: FontWeight.bold,
              ),
              SizedBox(
                height: MyApp.height * .008,
              ),
              CommonTextField(
                useUnderlineBorder: true,
                focusborder: 5,
                border: 5,
                enableborder: 5,
                controller: rooftype,
              ),
              SizedBox(
                height: MyApp.height * .02,
              ),
              TextThemedel(
                text: "Work Model",
                color: ColorData.textblackcolor,
                fontWeight: FontWeight.bold,
              ),
              SizedBox(
                height: MyApp.height * .01,
              ),
              CommonTextField(
                useUnderlineBorder: true,
                controller: roofmodel,
                focusborder: 5,
                border: 5,
                enableborder: 5,
              ),
              SizedBox(
                height: MyApp.height * .02,
              ),
              TextThemedel(
                text: "Work Preference",
                color: ColorData.textblackcolor,
                fontWeight: FontWeight.bold,
              ),
              SizedBox(
                height: MyApp.height * .01,
              ),
              CommonTextField(
                useUnderlineBorder: true,
                controller: roofpreference,
                focusborder: 5,
                border: 5,
                enableborder: 5,
              ),
              SizedBox(
                height: MyApp.height * .02,
              ),
              TextThemedel(
                text: "View Image",
                color: ColorData.textblackcolor,
                fontWeight: FontWeight.bold,
              ),
              SizedBox(
                height: MyApp.height * .01,
              ),
              GestureDetector(
                onTap: () {
                  Navi.toOff(Createestimateimagescreen());
                },
                child: Container(
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(5),
                      color: ColorData.whitecolor,
                      border: Border.all(color: ColorData.textfieldunfocuscolor)),
                  child: ListTile(
                    leading: Icon(Icons.visibility),
                    title: TextThemedel(
                      text: "Click here to View",
                      color: ColorData.textblackcolor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              SizedBox(
                height: MyApp.height * .04,
              ),
              Obx(
                () => Container(
                  padding: EdgeInsets.symmetric(horizontal: 5, vertical: 10),
                  decoration: BoxDecoration(
                    color: ColorData.whitecolor,
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          TextThemedel(
                            text: "Measurements",
                            color: ColorData.maincolor,
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                          Spacer(),
                          GestureDetector(
                            onTap: () {
                              controller.togglemeasurmentvalue();
                            },
                            child: controller.showmeasurment.value
                                ? Icon(
                                    Icons.keyboard_arrow_up,
                                  )
                                : Icon(
                                    Icons.keyboard_arrow_down,
                                  ),
                          )
                        ],
                      ),
                      Divider(),
                      controller.showmeasurment.value
                          ? Column(
                              children: [
                                Row(
                                  children: [
                                    Obx(() {
                                      return Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 15),
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                              color:
                                                  ColorData.textfieldunfocuscolor,
                                              width: 1.5),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: DropdownButtonHideUnderline(
                                          child: DropdownButton<int>(
                                            dropdownColor: ColorData.whitecolor,
                                            // Hint text displayed when no value is selected
                                            hint: TextThemedel(
                                              text: "Select Parking Type",
                                              color: ColorData.maincolor,
                                            ),
                                            value: controller
                                                        .selectedIndex.value ==
                                                    -1
                                                ? null
                                                : controller.selectedIndex.value,
                                            items: List.generate(
                                              controller.options.length,
                                              (index) => DropdownMenuItem<int>(
                                                value: index,
                                                child: Text(
                                                    controller.options[index]),
                                              ),
                                            ),
                                            onChanged: (value) {
                                              if (value != null) {
                                                controller.selectedIndex.value =
                                                    value;
                                              }
                                            },
                                            icon:
                                                const Icon(Icons.arrow_drop_down),
                                          ),
                                        ),
                                      );
                                    })
                                  ],
                                ),
                                SizedBox(height: MyApp.height * .04),
                                // Display selected index
                                Obx(() {
                                  return ListView.builder(
                                      physics: NeverScrollableScrollPhysics(),
                                      shrinkWrap: true,
                                      itemCount: controller.selectedIndex.value ==
                                              (-1)
                                          ? 0
                                          : controller.selectedIndex.value + 1,
                                      itemBuilder: (context, index) => Column(
                                            children: [
                                              Align(
                                                alignment:Alignment.centerLeft,
                                                child: TextThemedel(
                                                  text: "Measurement",
                                                  fontWeight: FontWeight.bold,
                                                  textDecorationthickness: 3,
                                                  fontSize: 20,
                                                  color:
                                                      ColorData.buttontextcolor,
                                                ),
                                              ),
                                              SizedBox(
                                                  height: MyApp.height * .02),
                                              Row(
                                                children: [
                                                  TextThemedel(
                                                    text: "Span   ",
                                                    color:
                                                        ColorData.textblackcolor,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                  Spacer(),
                                                  Expanded(
                                                      child: SizedBox(
                                                    child: CommonTextField(
                                                      fillcolor: ColorData.bgcolor,
                                                      keyboardType:
                                                          TextInputType.number,
                                                      controller: span,
                                                      contentpadding: 8,
                                                      enableborder: 8,
                                                      focusborder: 8,
                                                    ),
                                                    height: MyApp.height * .05,
                                                  )),
                                                ],
                                              ),
                                              SizedBox(
                                                  height: MyApp.height * .01),
                                              Row(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.center,
                                                children: [
                                                  TextThemedel(
                                                    text: "Length",
                                                    color:
                                                        ColorData.textblackcolor,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                  Spacer(),
                                                  Expanded(
                                                    child: SizedBox(
                                                      height: MyApp.height * .05,
                                                      child: CommonTextField(
                                                        fillcolor: ColorData.bgcolor,
                                                        keyboardType:
                                                            TextInputType.number,
                                                        controller: length,
                                                        contentpadding: 8,
                                                        enableborder: 8,
                                                        focusborder: 8,
                                                        hintstyle: TextStyle(
                                                            fontSize: 14),
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              SizedBox(
                                                  height: MyApp.height * .01),
                                              Row(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.center,
                                                children: [
                                                  TextThemedel(
                                                    text: "Height",
                                                    color:
                                                        ColorData.textblackcolor,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                  Spacer(),
                                                  Expanded(
                                                      child: SizedBox(
                                                    child: CommonTextField(
                                                      fillcolor: ColorData.bgcolor,
                                                      keyboardType:
                                                          TextInputType.number,
                                                      controller: height,
                                                      contentpadding: 8,
                                                      enableborder: 8,
                                                      focusborder: 8,
                                                    ),
                                                    height: MyApp.height * .05,
                                                  )),
                                                ],
                                              ),
                                              SizedBox(
                                                  height: MyApp.height * .01),
                                            ],
                                          ));
                                }),
                                SizedBox(height: MyApp.height * .02),
                                CommonMaterialButton(
                                  onPressed: () {
                                    controller.toggleestimtecard();
                                  },
                                  color: ColorData.maincolor,
                                  padding: EdgeInsets.symmetric(
                                      horizontal: MyApp.width * .06),
                                  child: TextThemedel(
                                    text: "Create  estimate",
                                    color: ColorData.whitecolor,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: MyApp.height * .02),
                              ],
                            )
                          : SizedBox.shrink()
                    ],
                  ),
                ),
              ),
              SizedBox(
                height: MyApp.height * .01,
              ),
              Obx(
                () => controller.showestimatecard.value
                    ? Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 5, vertical: 10),
                        decoration: BoxDecoration(
                          color: ColorData.whitecolor,
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                TextThemedel(
                                  text: "Estimation",
                                  color: ColorData.maincolor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 20,
                                ),
                                Spacer(),
                                GestureDetector(
                                  onTap: () {},
                                  child: Icon(
                                    Icons.delete,
                                  ),
                                ),
                                GestureDetector(
                                    onTap: () {},
                                    child: TextThemedel(text: "Delete")),
                              ],
                            ),
                            Divider(),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                TextThemedel(
                                  text: "Total sq. ft",
                                  color: ColorData.textblackcolor,
                                  fontWeight: FontWeight.bold,
                                ),
                                Spacer(),
                                Expanded(
                                    child: SizedBox(
                                  child: CommonTextField(
                                    keyboardType: TextInputType.number,
                                    controller: totalsqft,
                                    contentpadding: 8,
                                    enableborder: 8,
                                    focusborder: 8,
                                  ),
                                  height: MyApp.height * .05,
                                )),
                                TextThemedel(
                                  text: " sq.ft",
                                  fontSize: 20,
                                ),
                                SizedBox(
                                  width: MyApp.width * .09,
                                ),
                              ],
                            ),
                            SizedBox(height: MyApp.height * .01),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                TextThemedel(
                                  text: "Total Rate",
                                  color: ColorData.textblackcolor,
                                  fontWeight: FontWeight.bold,
                                ),
                                Spacer(),
                                TextThemedel(
                                  text: "₹ ",
                                  fontSize: 20,
                                ),
                                Expanded(
                                    child: SizedBox(
                                  child: CommonTextField(
                                    keyboardType: TextInputType.number,
                                    controller: Total_Rate,
                                    contentpadding: 8,
                                    enableborder: 8,
                                    focusborder: 8,
                                  ),
                                  height: MyApp.height * .05,
                                )),
                                SizedBox(
                                  width: MyApp.width * .2,
                                ),
                              ],
                            ),
                            SizedBox(height: MyApp.height * .01),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                TextThemedel(
                                  text: " Sq.ft Rate ",
                                  color: ColorData.textblackcolor,
                                  fontWeight: FontWeight.bold,
                                ),
                                Spacer(),
                                TextThemedel(
                                  text: "₹ ",
                                  fontSize: 20,
                                ),
                                Expanded(
                                    child: SizedBox(
                                      child: CommonTextField(
                                        keyboardType: TextInputType.number,
                                        controller: Total_Rate,
                                        contentpadding: 8,
                                        enableborder: 8,
                                        focusborder: 8,
                                      ),
                                      height: MyApp.height * .05,
                                    )),
                                SizedBox(
                                  width: MyApp.width * .2,
                                ),
                              ],
                            ),
                            SizedBox(height: MyApp.height * .01),
                            Center(
                              child: RichText(
                                text: TextSpan(
                                  text: "Please",
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: ColorData.textfieldunfocuscolor,
                                    fontWeight: FontWeight.w400,
                                  ),
                                  children: [
                                    TextSpan(
                                      text: " ",
                                    ),
                                    TextSpan(
                                      text: "Click here",
                                      style: TextStyle(
                                        color: ColorData.textbluecolor,
                                        fontWeight: FontWeight.w400,
                                      ),
                                      recognizer: TapGestureRecognizer()
                                        ..onTap = () {
                                          print("update"); // Action on click
                                        },
                                    ),
                                    TextSpan(
                                      text: " to update the status.",
                                      style: TextStyle(
                                        color: ColorData.textfieldunfocuscolor,
                                        fontWeight: FontWeight.w400,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            SizedBox(height: MyApp.height * .01),
                            Row(
                              children: [
                                TextThemedel(text: "Status"),
                                SizedBox(width: MyApp.width * .05),
                                Container(
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                      color: ColorData.greebuttoncolorbg,
                                      borderRadius: BorderRadius.circular(10)),
                                  child: TextThemedel(
                                    text: "Ongoing",
                                    fontWeight: FontWeight.bold,
                                    color: ColorData.greebuttoncolor,
                                  ),
                                ),
                                Spacer(),
                              ],
                            ),
                            SizedBox(height: MyApp.height * .01),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Container(
                                  padding: EdgeInsets.symmetric(
                                      vertical: 5, horizontal: 10),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(5),
                                      border: Border.all(
                                          color: ColorData.textfieldunfocuscolor,
                                          width: 1)),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(CupertinoIcons.share),
                                      TextThemedel(text: "Export")
                                    ],
                                  ),
                                ),
                                SizedBox(width: MyApp.width * .02),
                                Container(
                                  padding: EdgeInsets.symmetric(
                                      vertical: 5, horizontal: 10),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(5),
                                      border: Border.all(
                                          color: ColorData.textfieldunfocuscolor,
                                          width: 1)),
                                  child: Icon(
                                    Icons.share,
                                    color: ColorData.textfieldunfocuscolor,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: MyApp.height * .02),
                          ],
                        ),
                      )
                    : SizedBox.shrink(),
              ),
              SizedBox(
                height: MyApp.height * .01,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

