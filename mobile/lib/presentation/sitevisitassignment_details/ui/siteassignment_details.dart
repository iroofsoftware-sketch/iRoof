import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Color/Colordata.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/common/bottomsheet/ui/botttomsheet.dart';
import 'package:iroofing/common/common_textfield/common_textfield.dart';
import 'package:iroofing/common/elevted_button/ElevatedButton.dart';
import 'package:iroofing/common/text/textdata.dart';
import 'package:iroofing/presentation/clientdetails_imagepreview/ui/clientdetailsimagescreen.dart';
import 'package:iroofing/presentation/sitevisitassignment_details/controller/siteassignment_detailsController.dart';


import '../../../main.dart';
import '../../Notification/ui/notificationscreen.dart';

class SiteassignmentDetails extends StatelessWidget {
  final bool tohome;
  const SiteassignmentDetails({super.key,required this.tohome});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(siteassignment_detailsController());
    var span = TextEditingController(text: "20");
    var length = TextEditingController(text: "40");
    var height = TextEditingController(text: "60");
    var totalsqft = TextEditingController(text: "1020");
    var Total_Rate = TextEditingController(text: " 20000");
    var Sq_Rate = TextEditingController(text: " 200");
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        tohome
            ?Navi.to(Bottomsheetnavigation(),transition: Transition.leftToRight)
            :Navi.to(Bottomsheetnavigation(pos: 2,),transition: Transition.leftToRight);
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
                        tohome
                        ?Navi.to(Bottomsheetnavigation(),transition: Transition.leftToRight)
                        :Navi.to(Bottomsheetnavigation(pos: 2,),transition: Transition.leftToRight);
                      },
                      icon: Icon(Icons.arrow_back_ios),
                    ),
                    TextThemedel(
                      text: "Client Details",
                      color: ColorData.maincolor,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                    Spacer(),
                    TextThemedel(
                      text: "12/2/2024",
                      color: ColorData.textfieldunfocuscolor,
                    ),
                  ],
                ),
                Divider(),
                Row(
                  children: [
                    Spacer(),
                    TextButton.icon(
                      onPressed: () {},
                      label: TextThemedel(
                        text: "Edit",
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                      icon: Icon(
                        CupertinoIcons.pen,
                        size: 16,
                      ),
                      style: TextButton.styleFrom(
                        foregroundColor: ColorData.maincolor,
                        padding: EdgeInsets.zero,
                        minimumSize: Size(0, 0),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                  ],
                ),
                Container(
                  decoration: BoxDecoration(
                      color: ColorData.whitecolor,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: ColorData.textfieldunfocuscolor)),
                  child: ListTile(
                    leading: Icon(
                      CupertinoIcons.profile_circled,
                      color: ColorData.maincolor,
                    ),
                    title: TextThemedel(text: "Kevin M S"),
                    trailing: TextThemedel(text: "S123456"),
                  ),
                ),
                SizedBox(
                  height: MyApp.height * .01,
                ),
                Container(
                  decoration: BoxDecoration(
                      color: ColorData.whitecolor,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: ColorData.textfieldunfocuscolor)),
                  child: ListTile(
                    leading: Icon(
                      CupertinoIcons.phone_fill,
                      color: ColorData.maincolor,
                    ),
                    title: TextThemedel(text: "+91 8765 5643 32"),
                  ),
                ),
                SizedBox(
                  height: MyApp.height * .01,
                ),
                Container(
                  decoration: BoxDecoration(
                      color: ColorData.whitecolor,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: ColorData.textfieldunfocuscolor)),
                  child: ListTile(
                    leading: Icon(
                      Icons.location_on_sharp,
                      color: ColorData.maincolor,
                    ),
                    title: TextThemedel(text: "Aluva,Ernakulam,Kerala"),
                  ),
                ),
                SizedBox(
                  height: MyApp.height * .01,
                ),
                Container(
                  decoration: BoxDecoration(
                      color: ColorData.whitecolor,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: ColorData.textfieldunfocuscolor)),
                  child: ListTile(
                    leading: Icon(
                      Icons.roofing,
                      color: ColorData.maincolor,
                    ),
                    title: TextThemedel(text: "Normal cantilever"),
                  ),
                ),
                SizedBox(
                  height: MyApp.height * .01,
                ),
                Container(
                  decoration: BoxDecoration(
                      color: ColorData.whitecolor,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: ColorData.textfieldunfocuscolor)),
                  child: ListTile(
                    leading: Icon(
                      Icons.car_repair_outlined,
                      color: ColorData.maincolor,
                    ),
                    title: TextThemedel(text: "Car Porch"),
                  ),
                ),
                SizedBox(
                  height: MyApp.height * .01,
                ),
                GestureDetector(
                  onTap: () {
                    Navi.toOff(Clientdetailsimagescreen(tohome: tohome,));
                  },
                  child: Container(
                    decoration: BoxDecoration(
                        color: ColorData.whitecolor,
                        borderRadius: BorderRadius.circular(5),
                        border: Border.all(color: ColorData.textfieldunfocuscolor)),
                    child: ListTile(
                      leading: Icon(
                        Icons.image,
                        color: ColorData.maincolor,
                      ),
                      title: TextThemedel(text: "Images"),
                    ),
                  ),
                ),
                SizedBox(
                  height: MyApp.height * .01,
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
                                                color: ColorData
                                                    .textfieldunfocuscolor,
                                                width: 1.5),
                                            borderRadius:
                                                BorderRadius.circular(8),
                                          ),
                                          child: DropdownButtonHideUnderline(
                                            child: DropdownButton<int>(
                                              dropdownColor:ColorData.whitecolor,
                                              // Hint text displayed when no value is selected
                                              hint: TextThemedel(
                                                text: "Select Roof Preference",
                                                color: ColorData.maincolor,
                                              ),
                                              value: controller
                                                          .selectedIndex.value ==
                                                      -1
                                                  ? null
                                                  : controller
                                                      .selectedIndex.value,
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
                                              icon: const Icon(
                                                  Icons.arrow_drop_down),
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
                                      itemBuilder: (context, index) => Obx(
                                        () => Column(
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
                                            SizedBox(height: MyApp.height * .02),
                                            Row(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.center,
                                              children: [
                                                TextThemedel(
                                                  text: "Span    ",
                                                  color: ColorData.textblackcolor,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                                Spacer(),
                                                Expanded(
                                                    child: SizedBox(
                                                  child: CommonTextField(
                                                    fillcolor: ColorData.bgcolor,
                                                    maxLines: null,
                                                    keyboardType:
                                                        TextInputType.number,
                                                    readOnly:
                                                        controller.edit.value,
                                                    controller: span,
                                                    contentpadding: 8,
                                                    enableborder: 8,
                                                    focusborder: 8,
                                                  ),
                                                      height: MyApp.height*.05,
                                                    )),
                                              ],
                                            ),
                                            SizedBox(height: MyApp.height * .01),
                                            Row(
                                              crossAxisAlignment: CrossAxisAlignment.center,
                                              children: [
                                                TextThemedel(
                                                  text: "Length",
                                                  color: ColorData.textblackcolor,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                                Spacer(),
                                                Expanded(
                                                  child: SizedBox(
                                                    height: MyApp.height*.05,
                                                    child: CommonTextField(
                                                      fillcolor: ColorData.bgcolor,
                                                      keyboardType: TextInputType.number,
                                                      readOnly: controller.edit.value,
                                                      controller: length,
                                                      contentpadding: 8,
                                                      enableborder: 8,
                                                      focusborder: 8,
                                                      hintstyle: TextStyle(fontSize: 14),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            SizedBox(height: MyApp.height * .01),
                                            Row(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.center,
                                              children: [
                                                TextThemedel(
                                                  text: "Height",
                                                  color: ColorData.textblackcolor,
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
                                                    readOnly:
                                                        controller.edit.value,
                                                    contentpadding: 8,
                                                    enableborder: 8,
                                                    focusborder: 8,
                                                  ),
                                                      height: MyApp.height*.05,
                                                    )),
                                              ],
                                            ),
                                            SizedBox(height: MyApp.height * .01),
                                          ],
                                        ),
                                      ),
                                    );
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
                                  Row(
                                    children: [
                                      TextButton.icon(
                                        onPressed: () {
                                          controller.toggleedit();
                                        },
                                        label: TextThemedel(
                                          text: "Edit",
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        icon: Icon(
                                          CupertinoIcons.pen,
                                          size: 16,
                                        ),
                                        style: TextButton.styleFrom(
                                          foregroundColor: ColorData.maincolor,
                                          padding: EdgeInsets.zero,
                                          minimumSize: Size(0, 0),
                                          tapTargetSize:
                                              MaterialTapTargetSize.shrinkWrap,
                                        ),
                                      ),
                                      Spacer(),
                                      TextThemedel(
                                        text: "Add another Roof Preference",
                                        color: ColorData.maincolor,
                                      )
                                    ],
                                  ),
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
                                crossAxisAlignment:
                                CrossAxisAlignment.center,
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
                                          keyboardType:
                                          TextInputType.number,
                                          controller: totalsqft,
                                          contentpadding: 8,
                                          enableborder: 8,
                                          focusborder: 8,
                                        ),
                                        height: MyApp.height*.05,
                                      )),
                                  TextThemedel(text: " sq.ft",fontSize: 20,),
                                  SizedBox(
                                    width: MyApp.width * .09,
                                  ),
                                ],
                              ),
                              SizedBox(height: MyApp.height * .01),
                              Row(
                                crossAxisAlignment:
                                CrossAxisAlignment.center,
                                children: [
                                  TextThemedel(
                                    text: "Total Rate",
                                    color: ColorData.textblackcolor,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  Spacer(),
                                  TextThemedel(text: "₹ ",fontSize: 20,),
                                  Expanded(
                                      child: SizedBox(
                                        child: CommonTextField(
                                          keyboardType:
                                          TextInputType.number,
                                          controller: Total_Rate,
                                          contentpadding: 8,
                                          enableborder: 8,
                                          focusborder: 8,
                                        ),
                                        height: MyApp.height*.05,
                                      )),
                                  SizedBox(
                                    width: MyApp.width * .2,
                                  ),
                                ],
                              ),
                              SizedBox(height: MyApp.height * .01),
                              Row(
                                crossAxisAlignment:
                                CrossAxisAlignment.center,
                                children: [
                                  TextThemedel(
                                    text: " Sq.ft Rate ",
                                    color: ColorData.textblackcolor,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  Spacer(),
                                  TextThemedel(text: "₹ ",fontSize: 20,),
                                  Expanded(
                                      child: SizedBox(
                                        child: CommonTextField(
                                          keyboardType:
                                          TextInputType.number,
                                          controller: Sq_Rate,
                                          contentpadding: 8,
                                          enableborder: 8,
                                          focusborder: 8,
                                        ),
                                        height: MyApp.height*.05,
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
                                      color:
                                      ColorData.textfieldunfocuscolor,
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
                                          color: ColorData
                                              .textfieldunfocuscolor,
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
                                        borderRadius:
                                        BorderRadius.circular(10)),
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
                                        borderRadius:
                                        BorderRadius.circular(5),
                                        border: Border.all(
                                            color: ColorData
                                                .textfieldunfocuscolor,
                                            width: 1)),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment:
                                      MainAxisAlignment.center,
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
                                        borderRadius:
                                        BorderRadius.circular(5),
                                        border: Border.all(
                                            color: ColorData
                                                .textfieldunfocuscolor,
                                            width: 1)),
                                    child: Icon(
                                      Icons.share,
                                      color:
                                      ColorData.textfieldunfocuscolor,
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
      ),
    );
  }
}
