import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Color/Colordata.dart';
import 'package:iroofing/main.dart';
import 'package:iroofing/presentation/enterotp/ui/enterotp_screen.dart';
import 'package:iroofing/presentation/forgotpassword/controller/forgotpasswordcontroller.dart';
import 'package:iroofing/presentation/login/ui/loginpage.dart';

import '../../../common/Navigation/navigation.dart';
import '../../../common/common_textfield/common_textfield.dart';
import '../../../common/elevted_button/ElevatedButton.dart';
import '../../../common/text/textdata.dart';

class Forgotpassword extends StatelessWidget {
  const Forgotpassword({super.key});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(ForgotpasswordController());
    var email = TextEditingController();
    return PopScope(
      onPopInvoked: (didPop) {
        Navi.toOff(Loginpage(),transition: Transition.leftToRight);
      },
      canPop: false,
      child: Scaffold(
        backgroundColor: ColorData.maincolor,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Image.asset("assets/logo.png"),
                SizedBox(
                  height: MyApp.height * .02,
                ),
                Container(
                  height: MyApp.height * .45,
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
                                text: "Forgot Password ?",
                                color: ColorData.maincolor,
                                fontSize: 25,
                                fontWeight: FontWeight.bold,
                              ),
                              TextThemedel(
                                text: "Enter your email id",
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
                            text: "Email ID",
                            color: ColorData.textblackcolor,
                            fontSize: 20,
                          ),
                        ],
                      ),
                      SizedBox(
                        height: MyApp.height * .008,
                      ),
                      CommonTextField(
                        controller: email,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      SizedBox(
                        height: MyApp.height * .04,
                      ),
                      CommonMaterialButton(
                        width: double.infinity,
                        height: MyApp.height * .06,
                        borderRadius: BorderRadius.circular(5),
                        onPressed: () {
                          Navi.toOff(EnterotpScreen());
                        },
                        color: ColorData.maincolor,
                        elevation: 5,
                        child: TextThemedel(
                          text: "Send OTP",
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
    );
  }
}
