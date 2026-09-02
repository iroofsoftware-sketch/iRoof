import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../controller/ongoingassignmentupdatecontroller.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/common_textfield/common_textfield.dart';
import 'package:iroofing/common/elevted_button/ElevatedButton.dart';
import 'package:iroofing/common/text/textdata.dart';
import '../../../common/Color/Colordata.dart';
import '../../../common/Navigation/navigation.dart';


import '../../../common/bottomsheet/ui/botttomsheet.dart';
import '../../../core/ongoingassignment/ongoingassignmentWidgets/updatepagecard.dart';
import '../../../core/ongoingassignment/ongoingassignmentWidgetsController/updatepagecardcontroller.dart';
import '../../../main.dart';
import '../../Notification/ui/notificationscreen.dart';

class Ongoingassignmentupdatestatus extends StatelessWidget {
  const Ongoingassignmentupdatestatus({super.key});

  @override
  Widget build(BuildContext context) {
    var cardController = Get.put(UpdatepageCardController());
    var controller = Get.put(OngoingassignmentupdatestatusController());
    var comment = TextEditingController();

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        Navi.to(Bottomsheetnavigation(pos: 1,),transition: Transition.leftToRight);
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
                  label: TextThemedel(text: "0"),
                  child: Icon(
                    CupertinoIcons.bell_fill,
                    color: ColorData.whitecolor,
                  ),
                ))
          ],
        ),
        body: SingleChildScrollView(
          child: Column(
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: () {
                      Navi.to(Bottomsheetnavigation(pos: 1,),transition: Transition.leftToRight);
                    },
                    icon: Icon(Icons.arrow_back_ios),
                  ),
                ],
              ),
              Padding(
                padding: EdgeInsets.only(
                  bottom: MyApp.height * .08,
                  right: MyApp.width * .05,
                  left: MyApp.width * .05,
                ),
                child: Material(
                  elevation: 5,
                  color: ColorData.whitecolor,
                  borderRadius: BorderRadius.circular(5),
                  child: Column(
                    children: [
                      SizedBox(height: MyApp.height * .01),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: TextThemedel(
                              text: "Update Status",
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: ColorData.textbluecolor,
                            ),
                          )
                        ],
                      ),
                      Divider(
                        color: ColorData.textfieldunfocuscolor,
                        thickness: MyApp.height * .002,
                      ),
                      SizedBox(height: MyApp.height * .04),
                      Updatepagecard(title: "Site Visit", neededfortop: true),
                      Updatepagecard(title: "Estimation to be done"),
                      Updatepagecard(title: "Project Evaluation in Progress"),
                      Updatepagecard(title: "Quotation Provided"),
                      Updatepagecard(title: "Awaiting Client Response"),
                      Updatepagecard(title: "Call Back"),
                      Updatepagecard(title: "No Response from Client"),
                      Updatepagecard(title: "Project Rejected by Client"),
                      SizedBox(height: MyApp.height * .04),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 0, horizontal: 15),
                        child: CommonTextField(
                          controller: comment,
                          labelText: "Add Comment",
                          contentpadding: 20,
                          maxLines: 3,
                          labelstyle: TextStyle(
                            fontSize: 20,
                            color: ColorData.textblackcolor
                          ),
                        ),
                      ),
                      SizedBox(height: MyApp.height * .02),
                      Row(
                       mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                        CommonMaterialButton(
                          color: ColorData.buttontextcolor,
                          padding: EdgeInsets.symmetric(horizontal: MyApp.width*.08),
                          borderRadius: BorderRadius.circular(5),
                          onPressed: () {
                            final selectedStatus = cardController.selectedCard.value;
                            if (selectedStatus.isEmpty) {
                              Fluttertoast.showToast(
                                msg: "Please select a status",
                                toastLength: Toast.LENGTH_SHORT,
                                gravity: ToastGravity.BOTTOM,
                              );
                              return;
                            }
                            controller.updateStatus(selectedStatus);
                          },
                          child: TextThemedel(text: "Save",color: ColorData.whitecolor,),
                        ),
                        SizedBox(width: MyApp.width*.09,),
                        CommonMaterialButton(
                          padding: EdgeInsets.symmetric(horizontal: MyApp.width*.08),
                          borderRadius: BorderRadius.circular(10),
                          onPressed: () {
                            Navi.to(Bottomsheetnavigation(pos: 1,),transition: Transition.leftToRight);
                          },
                          color: ColorData.cancelbuttoncolor,
                          child: TextThemedel(text: "Cancel",color: ColorData.whitecolor,),
                        ),
                      ],),
                      SizedBox(height: MyApp.height * .04),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

