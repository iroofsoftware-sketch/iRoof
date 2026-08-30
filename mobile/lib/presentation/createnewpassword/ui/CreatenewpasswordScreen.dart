import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/presentation/createnewpassword/controller/createnewpasswordcontroller.dart';
import 'package:iroofing/presentation/enterotp/ui/enterotp_screen.dart';

import '../../../common/Color/Colordata.dart';

import '../../../common/common_textfield/common_textfield.dart';
import '../../../common/elevted_button/ElevatedButton.dart';
import '../../../common/text/textdata.dart';
import '../../../main.dart';
import '../../login/ui/loginpage.dart';

class Createnewpasswordscreen extends StatelessWidget {
  final String email;
  const Createnewpasswordscreen({super.key, required this.email});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(CreateNewPasswordController());
    var password = TextEditingController();
    var conformpassword = TextEditingController();
    return PopScope(
      onPopInvoked: (didPop) {
        Navi.toOff(EnterotpScreen(email: email),transition: Transition.leftToRight);
      },
      canPop: false,
      child: Scaffold(
        backgroundColor: ColorData.maincolor,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset("assets/logo.png"),
                  SizedBox(
                    height: MyApp.height * .02,
                  ),
                  Container(
                    height: MyApp.height * .6,
                    width: MyApp.width,
                    decoration: BoxDecoration(
                      color: ColorData.whitecolor,
                      borderRadius: BorderRadius.circular(15),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: Column(
                      children: [
                        SizedBox(
                          height: MyApp.height * .03,
                        ),
                        Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextThemedel(
                                  text: "Create New Password ",
                                  color: ColorData.maincolor,
                                  fontSize: 25,
                                  fontWeight: FontWeight.bold,
                                ),
                                TextThemedel(
                                  text:
                                      "The password must be different than before",
                                  color: ColorData.textfieldunfocuscolor,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ],
                            ),
                          ],
                        ),
                        SizedBox(
                          height: MyApp.height * .02,
                        ),
                        Row(
                          children: [
                            TextThemedel(
                              text: "New Password",
                              color: ColorData.textblackcolor,
                              fontSize: 20,
                            ),
                          ],
                        ),
                        SizedBox(
                          height: MyApp.height * .008,
                        ),
                        Obx(
                          () => CommonTextField(
                            maxLines: 1,
                            controller: password,
                            isPassword: !controller.showpassword.value,
                            suffixIcon: IconButton(
                                onPressed: () {
                                  controller.toggleshowpassword();
                                },
                                icon: Icon(controller.showpassword.value
                                    ? Icons.visibility
                                    : Icons.visibility_off)),
                          ),
                        ),
                        SizedBox(
                          height: MyApp.height * .02,
                        ),
                        Row(
                          children: [
                            TextThemedel(
                              text: "Confirm Password",
                              color: ColorData.textblackcolor,
                              fontSize: 20,
                            ),
                          ],
                        ),
                        SizedBox(
                          height: MyApp.height * .008,
                        ),
                        Obx(
                          () => CommonTextField(
                            maxLines: 1,
                            controller: conformpassword,
                            isPassword: !controller.showpassword.value,
                            suffixIcon: IconButton(
                                onPressed: () {
                                  controller.toggleshowpassword();
                                },
                                icon: Icon(controller.showpassword.value
                                    ? Icons.visibility
                                    : Icons.visibility_off)),
                          ),
                        ),
                        SizedBox(
                          height: MyApp.height * .04,
                        ),
                        CommonMaterialButton(
                          width: double.infinity,
                          height: MyApp.height * .06,
                          borderRadius: BorderRadius.circular(5),
                          onPressed: () {
                            controller.resetPassword(
                              email,
                              password.text.trim(),
                              conformpassword.text.trim(),
                            );
                          },
                          color: ColorData.maincolor,
                          elevation: 5,
                          child: TextThemedel(
                            text: "Save",
                            color: ColorData.whitecolor,
                            fontSize: 20,
                          ),
                        ),
                        SizedBox(
                          height: MyApp.height * .03,
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            TextThemedel(
                              text: "Remember Password ? ",
                              color: ColorData.maincolor,
                            ),
                            GestureDetector(
                              onTap: () {
                                Navi.toOff(Loginpage());
                              },
                              child: TextThemedel(
                                text: "Login",
                                color: ColorData.maincolor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
