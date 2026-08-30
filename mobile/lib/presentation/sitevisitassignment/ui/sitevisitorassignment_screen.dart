import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/presentation/sitevisitassignment/controller/sitevisitorassignmentcontroller.dart';
import 'package:iroofing/presentation/sitevisitassignment_details/ui/siteassignment_details.dart';

import '../../../common/Color/Colordata.dart';
import '../../../common/common_textfield/common_textfield.dart';
import '../../../common/elevted_button/ElevatedButton.dart';
import '../../../common/text/textdata.dart';
import '../../../main.dart';

class SitevisitorassignmentScreen extends StatelessWidget {
  const SitevisitorassignmentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(SitevisitorAssignmetController());
    var searchtext = TextEditingController();
    return SingleChildScrollView(
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 15, vertical: 20),
        child: Column(
          children: [
            Obx(
              () => Row(
                children: [
                  Visibility(
                    child: TextThemedel(
                      text: "Site Visit Assignment",
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      color: ColorData.maincolor,
                    ),
                    visible: controller.seeheading.value,
                  ),
                  Visibility(
                    visible: controller.seeheading.value,
                    child: SizedBox(
                      width: MyApp.width * .04,
                    ),
                  ),
                  Expanded(
                    child: SizedBox(
                        height: MyApp.height * .04,
                        child: CommonTextField(
                          suffixIcon: controller.seeheading.value == false
                              ? GestureDetector(
                                  onTap: () {
                                    controller.seeheading.value = true;
                                  },
                                  child: Icon(Icons.cancel_outlined))
                              : SizedBox.shrink(),
                          onTap: () {
                            controller.seeheading.value = false;
                          },
                          controller: searchtext,
                          border: 10,
                          focusborder: 10,
                          enableborder: 10,
                          maxLines: 1,
                          maxLength: 20,
                          prefixIcon: Icon(
                            Icons.search,
                            color: ColorData.maincolor,
                          ),
                          contentpadding: 0,
                          hintText: "Search",
                          hintstyle: TextStyle(
                              color: ColorData.textfieldunfocuscolor,
                              fontSize: 12),
                        )),
                  ),
                ],
              ),
            ),
            SizedBox(height: MyApp.height * .04,),
            ListView.builder(
              itemCount: 5,
              shrinkWrap: true,
              itemBuilder: (context, index) => Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: 5,
                    horizontal: 5
                ),
                child: Material(
                  borderRadius: BorderRadius.circular(5),
                  color: ColorData.whitecolor,
                  elevation: 5,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      // Align vertically
                      children: [
                        SizedBox(width: MyApp.width * .04),
                        Container(
                          width: MyApp.width*.1,
                          height: MyApp.height*.05,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              colors: [
                                ColorData.buttontextcolor,
                                ColorData.textfieldfocuscolor,
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: Icon(
                            Icons.location_pin,
                            color: ColorData.whitecolor,
                          ),
                        ),
                        SizedBox(width: MyApp.width * .02),
                        Expanded(
                          // Ensures text fits without overflow
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              TextThemedel(
                                text: "Kevin M S",
                                fontSize: 12,
                              ),
                              TextThemedel(
                                text: "07-10-2024",
                                color: ColorData.maincolor,
                                fontSize: 12,
                              ),
                            ],
                          ),
                        ),
                        // SizedBox(
                        //   height: MyApp.height * .05,
                        //   child: VerticalDivider(
                        //     color: ColorData.textfieldunfocuscolor,
                        //     thickness: 2,
                        //   ),
                        // ),
                        // Expanded(
                        //   child: TextThemedel(
                        //     text: "Aluva, Ernaku...",
                        //     textoverflow: TextOverflow.ellipsis,
                        //     color: ColorData.maincolor,
                        //     fontWeight: FontWeight.bold,
                        //   ),
                        // ),
                        CommonMaterialButton(
                          onPressed: () {
                            Navi.toOff(SiteassignmentDetails(tohome: false,));
                          },
                          width: MyApp.width * .4,
                          elevation: 10,
                          color: ColorData.maincolor,
                          child: TextThemedel(
                            textAlign: TextAlign.center,
                            text: "See details",
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: ColorData.whitecolor,
                          ),
                        ),
                        SizedBox(width: MyApp.width * .04),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
