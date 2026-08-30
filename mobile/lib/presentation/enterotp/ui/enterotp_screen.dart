import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/presentation/createnewpassword/ui/CreatenewpasswordScreen.dart';
import 'package:iroofing/presentation/enterotp/controller/enterotp_controller.dart';
import 'package:iroofing/presentation/login/ui/loginpage.dart';

import '../../../common/Color/Colordata.dart';
import '../../../common/common_textfield/common_textfield.dart';
import '../../../common/elevted_button/ElevatedButton.dart';
import '../../../common/text/textdata.dart';
import '../../../main.dart';

class EnterotpScreen extends StatelessWidget {
  const EnterotpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(EnterOTPController());
    var otp = TextEditingController();
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        Navi.toOff(Loginpage(),transition: Transition.leftToRight);
      },
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
                                text: "Enter the OTP",
                                color: ColorData.maincolor,
                                fontSize: 25,
                                fontWeight: FontWeight.bold,
                              ),
                              TextThemedel(
                                text: "An OTP will be send to your email id",
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
                            text: "Enter OTP",
                            color: ColorData.textblackcolor,
                            fontSize: 20,
                          ),
                        ],
                      ),
                      SizedBox(
                        height: MyApp.height * .008,
                      ),
                      CommonTextField(
                        controller: otp,
                        keyboardType: TextInputType.number,
                      ),
                      SizedBox(
                        height: MyApp.height * .04,
                      ),
                      CommonMaterialButton(
                        width: double.infinity,
                        height: MyApp.height * .06,
                        borderRadius: BorderRadius.circular(10),
                        onPressed: () {
                          Navi.toOff(Createnewpasswordscreen());
                        },
                        color: ColorData.maincolor,
                        elevation: 5,
                        child: TextThemedel(
                          text: "Continue",
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
                            text: "Didn't Receive OTP ? ",
                            color: ColorData.maincolor,
                          ),
                          GestureDetector(
                            onTap: () {},
                            child: TextThemedel(
                              text: "  Resend OTP",
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
