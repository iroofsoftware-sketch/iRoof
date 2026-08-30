import 'package:flutter/material.dart';
import 'package:iroofing/common/Color/Colordata.dart';

class CommonTextField extends StatelessWidget {
  final TextEditingController? controller;
  final String? hintText;
  final String? labelText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool isPassword;
  final TextInputType keyboardType;
  final TextCapitalization textCapitalization;
  final TextInputAction? textInputAction;
  final Function(String)? onChanged;
  final Function(String)? onSubmitted;
  final String? Function(String?)? validator;
  final FocusNode? focusNode;
  final int? maxLength;
  final int? maxLines;
  final VoidCallback? onTap;
  final double? border;
  final double? enableborder;
  final double? focusborder;
  final double? errorborder;
  final double? errorfocusborder;
  final double? contentpadding;
  final bool readOnly;
  final TextStyle? hintstyle;
  final TextStyle? labelstyle;
  final Color? fillcolor;
  final Color? focuscolor;
  final bool useUnderlineBorder; // New parameter for switching border type

  const CommonTextField({
    Key? key,
    this.controller,
    this.hintText,
    this.labelText,
    this.prefixIcon,
    this.suffixIcon,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
    this.textCapitalization = TextCapitalization.none,
    this.textInputAction,
    this.onChanged,
    this.onSubmitted,
    this.validator,
    this.focusNode,
    this.maxLength,
    this.maxLines,
    this.readOnly = false,
    this.onTap,
    this.border,
    this.focusborder,
    this.enableborder,
    this.errorborder,
    this.errorfocusborder,
    this.contentpadding,
    this.hintstyle,
    this.labelstyle,
    this.fillcolor,
    this.focuscolor,
    this.useUnderlineBorder = false, // Default to false
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    InputBorder getInputBorder(double? radius, Color borderColor) {
      return useUnderlineBorder
          ? UnderlineInputBorder(
        borderSide: BorderSide(color: borderColor),
      )
          : OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius ?? 5),
        borderSide: BorderSide(color: borderColor),
      );
    }

    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      textInputAction: textInputAction,
      obscureText: isPassword,
      maxLength: maxLength,
      maxLines: maxLines ?? 1,
      readOnly: readOnly,
      focusNode: focusNode,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      onTap: onTap,
      decoration: InputDecoration(
        filled: true,
        focusColor: focuscolor ?? Colors.white,
        fillColor: fillcolor ?? Colors.white,
        labelStyle: labelstyle,
        hintStyle: hintstyle,
        contentPadding: EdgeInsets.all(contentpadding ?? 10),
        hintText: hintText,
        labelText: labelText,
        prefixIcon: prefixIcon,
        suffixIcon: suffixIcon,
        border: getInputBorder(border, Colors.grey),
        enabledBorder: getInputBorder(enableborder, ColorData.textfieldunfocuscolor),
        focusedBorder: getInputBorder(focusborder, ColorData.textfieldfocuscolor),
        errorBorder: getInputBorder(errorborder, Colors.red),
        focusedErrorBorder: getInputBorder(errorfocusborder, Colors.redAccent),
        counterText: '',
      ),
    );
  }
}
