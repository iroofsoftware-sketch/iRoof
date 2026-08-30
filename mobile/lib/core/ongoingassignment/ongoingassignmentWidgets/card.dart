import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../common/Color/Colordata.dart';
import '../../../common/text/textdata.dart';
import '../../../main.dart';
import '../../../presentation/ongoingassignment/controller/ongoingassignment_controller.dart';

class ClientInfoCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData Icons;
  final IconData? detailsiconinactive;
  final IconData? detailsiconctive;
  final OngoingScrrenController? controller;

  const ClientInfoCard({
    Key? key,
    required this.title,
    required this.subtitle,
    required this.Icons,
    this.detailsiconinactive,
    this.detailsiconctive,
    this.controller,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: ColorData.ongoingcard,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1), // Shadow color
              offset: Offset(0, 4), // Shadow only on the bottom (4px down)
              blurRadius: 6, // Smoothens the shadow edges
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Icon(
                  Icons,
                  color: ColorData.textfieldunfocuscolor,
                ),
                SizedBox(width: 8), // Add spacing between icon and text
                TextThemedel(text: title),
                Spacer(),
                TextThemedel(
                  text: subtitle,
                  color: ColorData.textbluecolor,
                ),
                if (controller != null)
                  GestureDetector(
                    onTap: () {
                      controller!.seinnerdetails();
                    },
                    child: Obx(
                      () => controller!.showinnerdetails.value
                          ? Icon(
                              detailsiconctive,
                              color: ColorData.textbluecolor,
                            )
                          : Icon(
                              detailsiconinactive,
                              color: ColorData.textbluecolor,
                            ),
                    ),
                  )
              ],
            ),
            if (controller != null)
              Obx(
                () => controller!.showinnerdetails.value
                    ? Column(
                        children: [
                          SizedBox(
                            height: MyApp.height * .02,
                          ),
                          Row(
                            children: [
                              TextThemedel(
                                text: "Area 1",
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                              ),
                            ],
                          ),
                          SizedBox(
                            height: MyApp.height * .01,
                          ),
                          Row(
                            children: [
                              TextThemedel(
                                text: "Roof Type",
                                fontWeight: FontWeight.w500,
                                fontSize: 15,
                              ),
                              Spacer(),
                              TextThemedel(
                                text: "Normal cantilever",
                                fontWeight: FontWeight.w500,
                                fontSize: 15,
                                color: ColorData.textbluecolor,
                              ),
                            ],
                          ),
                          SizedBox(
                            height: MyApp.height * .01,
                          ),
                          Row(
                            children: [
                              TextThemedel(
                                text: "Roof model",
                                fontWeight: FontWeight.w500,
                                fontSize: 15,
                              ),
                              Spacer(),
                              TextThemedel(
                                text: "Model i",
                                fontWeight: FontWeight.w500,
                                fontSize: 15,
                                color: ColorData.textbluecolor,
                              ),
                            ],
                          ),
                          SizedBox(
                            height: MyApp.height * .01,
                          ),
                          Row(
                            children: [
                              TextThemedel(
                                text: "Roof Preference",
                                fontWeight: FontWeight.w500,
                                fontSize: 15,
                              ),
                              Spacer(),
                              TextThemedel(
                                text: "Single car ",
                                fontWeight: FontWeight.w500,
                                fontSize: 15,
                                color: ColorData.textbluecolor,
                              ),
                            ],
                          ),
                          SizedBox(
                            height: MyApp.height * .04,
                          ),
                          Container(
                            width: MyApp.width * .5,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextThemedel(
                                  text: "Round post / Square Tube",
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(
                                      text: "Span",
                                      fontSize: 15,
                                    ),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(text: "Length", fontSize: 15),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(
                                      text: "Height",
                                      fontSize: 15,
                                    ),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: MyApp.height * .04,
                          ),
                          Container(
                            width: MyApp.width * .5,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextThemedel(
                                  text: "25mm MS gutter",
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(
                                      text: "Span",
                                      fontSize: 15,
                                    ),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(text: "Length", fontSize: 15),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(
                                      text: "Height",
                                      fontSize: 15,
                                    ),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: MyApp.height * .04,
                          ),
                          Container(
                            width: MyApp.width * .5,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextThemedel(
                                  text: "ISA 25*25*6 mm",
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(
                                      text: "Span",
                                      fontSize: 15,
                                    ),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(text: "Length", fontSize: 15),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: MyApp.height * .01,
                                ),
                                Row(
                                  children: [
                                    TextThemedel(
                                      text: "Height",
                                      fontSize: 15,
                                    ),
                                    Spacer(),
                                    TextThemedel(
                                      text: "200 meter",
                                      fontWeight: FontWeight.bold,
                                      color: ColorData.textbluecolor,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: MyApp.height * .02,
                          ),
                        ],
                      )
                    : SizedBox.shrink(),
              )
          ],
        ),
      ),
    );
  }
}
