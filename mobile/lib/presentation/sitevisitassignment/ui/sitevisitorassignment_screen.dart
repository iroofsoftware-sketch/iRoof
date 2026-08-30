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
            Obx(() => Row(
              children: [
                Visibility(
                  visible: controller.seeheading.value,
                  child: TextThemedel(
                    text: "Site Visit Assignment",
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: ColorData.maincolor,
                  ),
                ),
                Visibility(
                  visible: controller.seeheading.value,
                  child: SizedBox(width: MyApp.width * .04),
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
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ],
            )),
            SizedBox(height: MyApp.height * .04),
            Obx(() {
              if (controller.isLoading.value) {
                return Center(
                  child: CircularProgressIndicator(color: ColorData.maincolor),
                );
              }
              if (controller.errorMessage.value.isNotEmpty) {
                return Center(
                  child: TextThemedel(
                    text: controller.errorMessage.value,
                    color: Colors.red,
                  ),
                );
              }
              if (controller.assignments.isEmpty) {
                return Center(
                  child: TextThemedel(text: "No assignments found"),
                );
              }
              return ListView.builder(
                itemCount: controller.assignments.length,
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  final assignment = controller.assignments[index];
                  final client = assignment['clientId'];
                  final clientName = client?['name'] ?? 'Unknown Client';
                  final visitDate = assignment['sitevisitDate'] != null
                      ? assignment['sitevisitDate'].toString().substring(0, 10)
                      : 'No date';
                  final status = assignment['status'] ?? 'Site Visit';

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 5),
                    child: Material(
                      borderRadius: BorderRadius.circular(5),
                      color: ColorData.whitecolor,
                      elevation: 5,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 5),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            SizedBox(width: MyApp.width * .04),
                            Container(
                              width: MyApp.width * .1,
                              height: MyApp.height * .05,
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
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  TextThemedel(text: clientName, fontSize: 12),
                                  TextThemedel(
                                    text: visitDate,
                                    color: ColorData.maincolor,
                                    fontSize: 12,
                                  ),
                                  TextThemedel(
                                    text: status,
                                    color: Colors.orange,
                                    fontSize: 10,
                                  ),
                                ],
                              ),
                            ),
                            CommonMaterialButton(
                              onPressed: () {
                                Navi.toOff(SiteassignmentDetails(
                                  tohome: false,
                                  assignment: assignment,
                                ));
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
                  );
                },
              );
            }),
          ],
        ),
      ),
    );
  }
}
