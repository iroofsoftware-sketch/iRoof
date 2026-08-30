import 'package:flutter/material.dart';
import 'package:iroofing/common/Color/Colordata.dart';
import 'package:iroofing/common/common_textbutton/commontext_button.dart';
import 'package:iroofing/common/text/textdata.dart';

class CustomAlertBox extends StatelessWidget {
  final String title;
  final String message;
  final Color backgroundColor;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final bool? cangoback;
  final List <CommonTextButton>button;
  final Color? titlecolor;
  final Color? messagecolor;
  final TextDecoration? textDecoration;

  const CustomAlertBox({
    Key? key,
    required this.title,
    required this.message,
    this.backgroundColor = Colors.white,
    this.borderRadius = 10.0,
    this.padding = const EdgeInsets.all(16.0),
    this.cangoback,
    this.titlecolor,
    this.messagecolor,
    this.textDecoration,
    required this.button,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: cangoback ?? true,
      child: AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        backgroundColor: backgroundColor,
        contentPadding: padding,
        title: Center(
          child: TextThemedel(
            text: title,
            color: titlecolor??ColorData.maincolor,
            decoration: textDecoration,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextThemedel(
              text: message,
              fontSize: 18,
              color: messagecolor??ColorData.textblackcolor,
              fontWeight: FontWeight.bold,
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children:button.map((buttons){
                return CommonTextButton(
                  color: buttons.color,
                  padding: buttons.padding,
                  borderRadius: buttons.borderRadius,
                  onPressed: buttons.onPressed,
                  child: buttons.child,
                  icon: buttons.icon,
                );
              }).toList()
            ),
          ],
        ),
      ),
    );
  }
}
