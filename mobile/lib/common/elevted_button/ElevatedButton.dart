import 'package:flutter/material.dart';

class CommonMaterialButton extends StatelessWidget {
  final double? width;
  final double? height;
  final BorderRadiusGeometry? borderRadius;
  final VoidCallback? onPressed;
  final Color? color;
  final double? elevation;
  final Widget? child;
  final Color? disabledColor;
  final Color? splashColor;
  final EdgeInsetsGeometry? padding;
  final BorderSide? side;

  const CommonMaterialButton({
    Key? key,
    this.width,
    this.height,
    this.borderRadius,
    this.onPressed,
    this.color,
    this.elevation,
    this.child,
    this.disabledColor,
    this.splashColor,
    this.padding,
    this.side,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          elevation: elevation ?? 2, // Default elevation
          backgroundColor: color ?? Theme.of(context).primaryColor,
          disabledBackgroundColor: disabledColor,
          splashFactory: splashColor != null
              ? InkSplash.splashFactory
              : null, // Use custom splash color if provided
          shape: RoundedRectangleBorder(
            borderRadius: borderRadius ?? BorderRadius.circular(5),
            side: side ?? BorderSide.none, // Default no border
          ),
          padding: padding ?? const EdgeInsets.symmetric(vertical: 5,),
        ),
        child: child,
      ),
    );
  }
}
