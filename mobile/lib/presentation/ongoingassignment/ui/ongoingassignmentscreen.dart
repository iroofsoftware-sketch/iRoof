import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Color/Colordata.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/common/elevted_button/ElevatedButton.dart';
import 'package:iroofing/common/text/textdata.dart';
import 'package:iroofing/presentation/ongoingassignment/controller/ongoingassignment_controller.dart';
import 'package:iroofing/presentation/ongoingassignment_updatestatus/ui/ongoingassignmentupdatestatus.dart';
import '../../../common/common_textfield/common_textfield.dart';
import '../../../core/ongoingassignment/ongoingassignmentWidgets/card.dart';
import '../../../core/ongoingassignment/ongoingassignmentWidgets/clientdetailssec.dart';
import '../../../main.dart';

String _getClientName(dynamic assignment) {
  try { return assignment['clientId']['name'] ?? 'Unknown'; } catch (e) { return 'Unknown'; }
}
String _getClientPhone(dynamic assignment) {
  try { return assignment['clientId']['phoneNo'] ?? 'N/A'; } catch (e) { return 'N/A'; }
}
String _getClientPlace(dynamic assignment) {
  try { return assignment['clientId']['place'] ?? 'N/A'; } catch (e) { return 'N/A'; }
}

class Ongoingassignmentscreen extends StatelessWidget {
  const Ongoingassignmentscreen({super.key});

  @override
  Widget build(BuildContext context) {
    var searchtext = TextEditingController();
    var controller = Get.put(OngoingScrrenController());
    return Container(
      color: ColorData.bgcolor,
      padding: EdgeInsets.symmetric(horizontal: 15, vertical: 0),
      child: Column(
        children: [
          Obx(
                () => Row(
              children: [
                Visibility(
                  child: TextThemedel(
                    text: "Ongoing Assignment",
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: ColorData.maincolor,
                  ),
                  visible: controller.search.value,
                ),
                Visibility(
                  visible: controller.search.value,
                  child: SizedBox(
                    width: MyApp.width * .04,
                  ),
                ),
                controller.search.value ? Spacer() : SizedBox.shrink(),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder: (child, animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: child,
                      );
                    },
                    child: controller.search.value
                        ? IconButton(
                      key: ValueKey('searchIcon'),
                      onPressed: () {
                        controller.seesearch();
                      },
                      icon: Icon(Icons.search),
                      color: ColorData.maincolor,
                    )
                        : SizedBox(
                      key: ValueKey('searchField'),
                      height: MyApp.height * .04,
                      child: CommonTextField(
                        suffixIcon: GestureDetector(
                          onTap: () {
                            controller.seesearch();
                          },
                          child: Icon(Icons.cancel_outlined),
                        ),
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
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            height: MyApp.height * .02,
          ),
          Obx(
            () => Expanded(
                child: ListView.builder(
              shrinkWrap: true,
              itemCount: controller.search.value == false ? 1 : controller.assignments.length,
              physics: BouncingScrollPhysics(),
              itemBuilder: (context, index) {
                return Obx(
                  () => controller.indexval.value != index
                      ? Padding(
                          padding: const EdgeInsets.symmetric(
                              vertical: 5, horizontal: 5),
                          child: Material(
                            elevation: 5,
                            color: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(15),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Icon(
                                        Icons.copy,
                                        size: 12,
                                        color: ColorData.textfieldunfocuscolor,
                                      ),
                                      SizedBox(width: 5),
                                      Text(
                                        controller.assignments.isNotEmpty ? controller.assignments[index]['_id']?.toString().substring(0, 8) ?? 'N/A' : 'N/A',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color:
                                              ColorData.textfieldunfocuscolor,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 15),
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      // Circle Icon
                                      CircleAvatar(
                                        backgroundColor:
                                            ColorData.textfieldfocuscolor,
                                        child: Icon(
                                          Icons.content_paste_search_sharp,
                                          color: ColorData.whitecolor,
                                        ),
                                      ),
                                      const SizedBox(width: 15),
                                      // Text Details
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            RichText(
                                              text: TextSpan(
                                                text: "Roofing type: ",
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  color: ColorData.maincolor,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                                children: [
                                                  TextSpan(
                                                    text: controller.assignments.isNotEmpty ? controller.assignments[index]['status'] ?? 'N/A' : 'N/A',
                                                    style: TextStyle(
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color:
                                                          ColorData.maincolor,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(height: 5),
                                            RichText(
                                              text: TextSpan(
                                                text: "Customer Name: ",
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  color: ColorData
                                                      .textfieldunfocuscolor,
                                                  fontWeight: FontWeight.w400,
                                                ),
                                                children: [
                                                  TextSpan(
                                                    text: controller.assignments.isNotEmpty ? _getClientName(controller.assignments[index]) : 'Unknown',
                                                    style: TextStyle(
                                                      color: ColorData
                                                          .textfieldunfocuscolor,
                                                      fontWeight:
                                                          FontWeight.w400,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(height: 5),
                                            Row(
                                              children: [
                                                Icon(
                                                  Icons.location_on,
                                                  color: ColorData.maincolor,
                                                  size: 18,
                                                ),
                                                const SizedBox(width: 5),
                                                Text(
                                                  controller.assignments.isNotEmpty ? _getClientPlace(controller.assignments[index]) : 'N/A',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: ColorData.maincolor,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      // "See Details" Button
                                      CommonMaterialButton(
                                        padding:
                                            EdgeInsets.symmetric(horizontal: 5),
                                        elevation: 5,
                                        color: ColorData.maincolor,
                                        onPressed: () {
                                          controller.seedetailsfun(index);
                                        },
                                        child: TextThemedel(
                                          text: "See details",
                                          fontWeight: FontWeight.bold,
                                          color: ColorData.whitecolor,
                                        ),
                                      )
                                    ],
                                  ),
                                  const SizedBox(height: 15),
                                  // Bottom Row with Location Icon and Address
                                ],
                              ),
                            ),
                          ))
                      : Padding(
                          padding: const EdgeInsets.symmetric(
                              vertical: 5, horizontal: 5),
                          child: Material(
                            elevation: 5,
                            color: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CustomRowWidget(
                                      controller: controller,
                                      tittle: "Client details",
                                      subtitle: controller.assignments.isNotEmpty ? controller.assignments[index]['status'] ?? 'N/A' : 'N/A',
                                      toptext: controller.assignments.isNotEmpty ? controller.assignments[index]['_id']?.toString().substring(0, 8) ?? 'N/A' : 'N/A'),
                                  SizedBox(height: MyApp.height * .01),
                                  Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      ClientInfoCard(
                                          title: "Client Name",
                                          subtitle: controller.assignments.isNotEmpty ? _getClientName(controller.assignments[index]) : 'N/A',
                                          Icons: CupertinoIcons
                                              .person_crop_circle),
                                      ClientInfoCard(
                                          title: "Phone no",
                                          subtitle: controller.assignments.isNotEmpty ? _getClientPhone(controller.assignments[index]) : 'N/A',
                                          Icons: CupertinoIcons.phone_fill),
                                      ClientInfoCard(
                                          title: "Location",
                                          subtitle: controller.assignments.isNotEmpty ? _getClientPlace(controller.assignments[index]) : 'N/A',
                                          Icons: CupertinoIcons.location_solid),
                                      ClientInfoCard(
                                        title: "Total sq. ft ",
                                        subtitle: controller.assignments.isNotEmpty ? '${controller.assignments[index]['totalAreaSqFt'] ?? 0} sq. ft' : 'N/A',
                                        Icons: Icons.straighten,
                                        detailsiconinactive:
                                            Icons.arrow_drop_down,
                                        controller: controller,
                                        detailsiconctive: Icons.arrow_drop_up,
                                      ),
                                      ClientInfoCard(
                                          title: "Total Cost",
                                          subtitle: controller.assignments.isNotEmpty ? '₹${controller.assignments[index]['totalBudget'] ?? 0}/-' : 'N/A',
                                          Icons: Icons.currency_rupee),
                                      ClientInfoCard(
                                          title: "Sq Ft rate",
                                          subtitle: controller.assignments.isNotEmpty ? '₹${controller.assignments[index]['sellingRate'] ?? 0}/-' : 'N/A',
                                          Icons: Icons.currency_rupee),
                                      ClientInfoCard(
                                          title: "Site Visited ",
                                          subtitle: controller.assignments.isNotEmpty && controller.assignments[index]['sitevisitDate'] != null ? controller.assignments[index]['sitevisitDate'].toString().substring(0, 10) : 'N/A',
                                          Icons: Icons.calendar_month),
                                      ClientInfoCard(
                                          title: "Work Started",
                                          subtitle: "25-08-2024",
                                          Icons: Icons.calendar_month),
                                    ],
                                  ),
                                  SizedBox(height: MyApp.height * .02),
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
                                      TextButton.icon(
                                          icon: Icon(
                                            Icons.image,
                                            color:
                                                ColorData.textfieldunfocuscolor,
                                          ),
                                          onPressed: () {},
                                          label: TextThemedel(
                                            text: "View image",
                                            color: ColorData.textbluecolor,
                                          ))
                                    ],
                                  ),
                                  SizedBox(height: MyApp.height * .02),
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
                                                Navi.toOff(
                                                    Ongoingassignmentupdatestatus());
                                                print("ji"); // Action on click
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
                                  SizedBox(height: MyApp.height * .02),
                                ],
                              ),
                            ),
                          )),
                );
              },
            )),
          )
        ],
      ),
    );
  }
}
