import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Color/Colordata.dart';
import 'package:iroofing/common/Navigation/navigation.dart';
import 'package:iroofing/common/common_textfield/common_textfield.dart';
import 'package:iroofing/common/elevted_button/ElevatedButton.dart';
import 'package:iroofing/common/text/textdata.dart';
import 'package:iroofing/main.dart';
import 'package:iroofing/presentation/forgotpassword/ui/forgotpassword.dart';
import 'package:iroofing/presentation/login/controller/logincontroller.dart';



class Loginpage extends StatelessWidget {
  const Loginpage({super.key});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(LoginController());
    var email = TextEditingController();
    var password = TextEditingController();
    return PopScope(
      onPopInvoked: (didPop) {
        SystemNavigator.pop();
      },
      canPop: true,
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
                  height: MyApp.height * .5,
                  width: MyApp.width,
                  decoration: BoxDecoration(
                    color: ColorData.whitecolor,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Column(
                    children: [
                      SizedBox(
                        height: MyApp.height * .02,
                      ),
                      Row(
                        children: [
                          TextThemedel(
                            text: "Login",
                            color: ColorData.maincolor,
                            fontSize: 25,
                            fontWeight: FontWeight.bold,
                          ),
                        ],
                      ),
                      SizedBox(
                        height: MyApp.height * .002,
                      ),
                      Row(
                        children: [
                          TextThemedel(
                            text: "Email ID",
                            color: ColorData.textblackcolor,
                            fontSize: 15,
                          ),
                        ],
                      ),
                      CommonTextField(
                        controller: email,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      Row(
                        children: [
                          TextThemedel(
                            text: "Password",
                            color: ColorData.textblackcolor,
                            fontSize: 15,
                          ),
                        ],
                      ),
                      Obx(
                        () => CommonTextField(
                          controller: password,
                          isPassword: !controller.showpassword.value,
                          suffixIcon: IconButton(
                              onPressed: () {
                                controller.togglepass();
                              },
                              icon: Icon(controller.showpassword.value
                                  ? Icons.visibility_off
                                  : Icons.visibility)),
                        ),
                      ),
                      SizedBox(
                        height: MyApp.height * .002,
                      ),
                      Row(
                        children: [
                          Obx(
                            () => Checkbox(
                              activeColor: ColorData.maincolor,
                              value: controller.rememberme.value,
                              onChanged: (value) {
                                controller.togglerememberme();
                              },
                            ),
                          ),
                          TextThemedel(
                            text: "Remember me",
                            color: ColorData.maincolor,
                          )
                        ],
                      ),
                      Obx(() => controller.isLoading.value
                        ? Center(child: CircularProgressIndicator(color: ColorData.maincolor))
                        : CommonMaterialButton(
                            width: double.infinity,
                            height: MyApp.height * .06,
                            borderRadius: BorderRadius.circular(5),
                            onPressed: () {
                              controller.login(email.text.trim(), password.text.trim());
                            },
                            color: ColorData.maincolor,
                            elevation: 5,
                            child: TextThemedel(
                              text: "Login",
                              color: ColorData.whitecolor,
                              fontSize: 20,
                            ),
                          ),
                      ),
                      SizedBox(
                        height: MyApp.height * .03,
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          TextThemedel(
                            text: "Forgot Password ? ",
                            color: ColorData.maincolor,
                          ),
                          GestureDetector(
                            onTap: () {
                              Navi.toOff(Forgotpassword());
                            },
                            child: TextThemedel(
                              text: "Reset Password",
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
