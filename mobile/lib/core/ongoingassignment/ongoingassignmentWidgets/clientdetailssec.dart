import 'package:flutter/material.dart';
import 'package:iroofing/common/Color/Colordata.dart';
import 'package:iroofing/main.dart';
import '../../../common/text/textdata.dart';
import '../../../presentation/ongoingassignment/controller/ongoingassignment_controller.dart';

class CustomRowWidget extends StatelessWidget {
  final OngoingScrrenController controller;
  final String toptext;
  final String tittle;
  final String subtitle;

  const CustomRowWidget({
    Key? key,
    required this.controller,
    required this.tittle,
    required this.subtitle,
    required this.toptext,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
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
            TextThemedel(
              text: toptext,
              fontSize: 12,
              color: ColorData.textfieldunfocuscolor,
              fontWeight: FontWeight.bold,
            ),
            Spacer(),
            IconButton(
              onPressed: () {
                controller
                    .resetView(); // Using the passed in controller function
              },
              icon: Icon(Icons.arrow_drop_down_sharp),
            ),
          ],
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircleAvatar(
              minRadius: MyApp.height * .02,
              backgroundColor: ColorData.textfieldfocuscolor,
              child: Icon(
                Icons.content_paste_search_sharp,
                color: ColorData.whitecolor,
                size: MyApp.height * .02,
              ),
            ),
            SizedBox(
              width: MyApp.width * .01,
            ),
            TextThemedel(
              text: tittle,
              color: ColorData.maincolor,
              fontWeight: FontWeight.w500,
              fontSize: 25,
            ),
            Spacer(),
            TextThemedel(
              text: subtitle,
              color: ColorData.maincolor,
              fontWeight: FontWeight.normal,
              fontSize: 20,
            ),
          ],
        ),
      ],
    );
  }
}
