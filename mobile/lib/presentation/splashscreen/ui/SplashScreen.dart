import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/Color/Colordata.dart';
import 'package:iroofing/main.dart';
import 'package:iroofing/presentation/splashscreen/controller/splashscreencontroller.dart';

class Splashscreen extends StatelessWidget {
  const Splashscreen({super.key});

  @override
  Widget build(BuildContext context) {
    var controller = Get.put(SplashscreenController());
    return PopScope(
      canPop: false,
      child: Scaffold(
        body: Container(
          height: MyApp.height,
          width: MyApp.width,
          decoration: BoxDecoration(
              image: const DecorationImage(image: AssetImage("assets/logo.png")),
              color: ColorData.maincolor),
        ),
      ),
    );
  }
}
