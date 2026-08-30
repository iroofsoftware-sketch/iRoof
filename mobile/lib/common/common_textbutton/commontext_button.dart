import 'package:flutter/material.dart';

class CommonTextButton extends StatelessWidget {
  final double? width;
  final double? height;
  final BorderRadiusGeometry? borderRadius;
  final VoidCallback? onPressed;
  final Color? color;
  final Color? disabledColor;
  final Color? splashColor;
  final EdgeInsetsGeometry? padding;
  final Widget? child;
  final Widget? icon;
  final BorderSide? side;
  final MainAxisAlignment alignment;

  const CommonTextButton({
    Key? key,
    this.width,
    this.height,
    this.borderRadius,
    this.onPressed,
    this.color,
    this.disabledColor,
    this.splashColor,
    this.padding,
    this.child,
    this.icon,
    this.side,
    this.alignment = MainAxisAlignment.center,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          backgroundColor: color ?? Colors.transparent,
          disabledBackgroundColor: disabledColor,
          splashFactory: splashColor != null ? InkSplash.splashFactory : null,
          padding: padding ?? const EdgeInsets.symmetric(vertical: 5),
          shape: RoundedRectangleBorder(
            borderRadius: borderRadius ?? BorderRadius.circular(5),
            side: side ?? BorderSide.none,
          ),
        ),
        child: icon != null
            ? Row(
          mainAxisAlignment: alignment,
          mainAxisSize: MainAxisSize.min,
          children: [
            icon!,
            if (child != null) ...[
              const SizedBox(width: 8),
              child!,
            ],
          ],
        )
            : child ?? const SizedBox.shrink(),
      ),
    );
  }
}
