import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Color/Colordata.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/common/common_textfield/common_textfield.dart';
import 'package:iroofing/common/elevted_button/ElevatedButton.dart';
import 'package:iroofing/common/text/textdata.dart';
import 'package:iroofing/main.dart';
import 'package:iroofing/presentation/create_estimation/ui/estimationscreen.dart';
import 'package:iroofing/presentation/sitevisitassignment_details/ui/siteassignment_details.dart';
import 'package:iroofing/presentation/sitevisitor/controller/sitevisitor_controller.dart';
import '../../../common/bottomsheet/controller/controller.dart';

class SitevisitorScreen extends StatelessWidget {
  const SitevisitorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(SiteVisitorController());
    return Container(
      padding: EdgeInsets.only(
        right: 20,left: 20,top: 15
      ),
      color: ColorData.bgcolor,
      child: Column(
        children: [
          SizedBox(
              height: MyApp.height * .04,
              child: CommonTextField(
                border: 10,
                focusborder: 10,
                enableborder: 10,
                maxLines: 1,
                maxLength: 20,
                prefixIcon: Icon(
                  Icons.search,
                  color: ColorData.maincolor,
                ),
                hintText: "Search",
                contentpadding: 0,
                hintstyle: TextStyle(
                    color: ColorData.textfieldunfocuscolor, fontSize: 15),
              )),
          SizedBox(
            height: MyApp.height * .02,
          ),
          GestureDetector(
            onTap: () {
              var controller = Get.find<NavigationController>();
              controller.updateSelectedPos(3);
            },
            child: Card(
              color: ColorData.whitecolor,
              elevation: 5,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Row(
                  children: [
                    SizedBox(
                      width: MyApp.width * .04,
                    ),
                    CircleAvatar(
                      backgroundColor: ColorData.whitecolor,
                      child: Image.asset(
                        "assets/profileimg.png",
                        fit: BoxFit.contain,
                      ),
                    ),
                    SizedBox(
                      width: MyApp.width * .02,
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextThemedel(text: "Kevin M S"),
                        TextThemedel(
                          text: "S123456",
                          color: ColorData.textfieldunfocuscolor,
                          fontSize: 10,
                        ),
                      ],
                    ),
                    Spacer(),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Icon(Icons.arrow_forward_ios_outlined),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Card(
            color: ColorData.whitecolor,
            elevation: 5,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Row(
                children: [
                  SizedBox(
                    width: MyApp.width * .04,
                  ),
                  CircleAvatar(
                    backgroundColor: ColorData.textfieldfocuscolor,
                    child: Icon(Icons.content_paste_search_sharp,color: ColorData.whitecolor,),
                  ),
                  SizedBox(
                    width: MyApp.width * .02,
                  ),
                  TextThemedel(
                    text: "Ongoing  Assignment",
                    color: ColorData.maincolor,
                    fontWeight: FontWeight.bold,
                  ),
                  Spacer(),
                  CommonMaterialButton(
                    onPressed: () {
                      var controller = Get.find<NavigationController>();
                      controller.updateSelectedPos(1);
                    },
                    elevation: 10,
                    color: ColorData.maincolor,
                    child: TextThemedel(
                      text: "View all",
                      fontWeight: FontWeight.bold,
                      color: ColorData.whitecolor,
                    ),
                  ),
                  SizedBox(
                    width: MyApp.width * .04,
                  ),
                ],
              ),
            ),
          ),
          GestureDetector(
            onTap: () {
              Navi.toOff(Estimationscreen());
            },
            child: Card(
              color: ColorData.whitecolor,
              elevation: 5,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Row(
                  children: [
                    SizedBox(
                      width: MyApp.width * .04,
                    ),
                    CircleAvatar(
                      backgroundColor: ColorData.textfieldfocuscolor,
                      child: Icon(Icons.newspaper_outlined,color: ColorData.whitecolor,),
                    ),
                    SizedBox(
                      width: MyApp.width * .02,
                    ),
                    TextThemedel(
                      text: "Estimation",
                      color: ColorData.maincolor,
                      fontWeight: FontWeight.bold,
                    ),
                    Spacer(),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Icon(Icons.arrow_forward_ios_outlined),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SizedBox(
            height: MyApp.height * .02,
          ),
          Row(
            children: [
              TextThemedel(
                text: "Site Visit Assignment",
                color: ColorData.maincolor,
                fontWeight: FontWeight.bold,
              ),
            ],
          ),
          SizedBox(
            height: MyApp.height * .02,
          ),
          Expanded(
            child: ListView.builder(
              physics: BouncingScrollPhysics(),
              itemCount: 15,
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
                            Navi.offAll(SiteassignmentDetails(tohome: true,));
                          },
                          width: MyApp.width * .3,
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
          )
        ],
      ),
    );
  }
}
