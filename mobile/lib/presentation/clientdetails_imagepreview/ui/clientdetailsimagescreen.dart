import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iroofing/common/text/textdata.dart';
import 'package:photo_view/photo_view.dart';
import '../../../common/Color/Colordata.dart';
import '../../../common/Navigation/navigation.dart';
import '../../../common/bottomsheet/ui/botttomsheet.dart';
import '../../../main.dart';
import '../../Notification/ui/notificationscreen.dart';
import '../../sitevisitassignment_details/ui/siteassignment_details.dart';

class Clientdetailsimagescreen extends StatelessWidget {
  const Clientdetailsimagescreen({super.key, this.image, this.imagename,required this.tohome});

  final String? image;
  final String? imagename;
  final bool tohome;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        Navi.to(SiteassignmentDetails(tohome: tohome,),transition: Transition.leftToRight);
      },
      child: Scaffold(
        backgroundColor: ColorData.textblackcolor,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: ColorData.maincolor,
          title: Image.asset(
            "assets/logo.png",
            height: MyApp.height * .05,
          ),
          actions: [
                IconButton(
                onPressed: () {
                  Navi.toOff(NotificationScreen());
                },
                icon: Badge(
                  label: TextThemedel(text: "5"),
                  child: Icon(
                    CupertinoIcons.bell_fill,
                    color: ColorData.whitecolor,
                  ),
                ))
          ],
        ),
        body: Column(
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () {
                    Navi.to(SiteassignmentDetails(tohome: tohome,),transition: Transition.leftToRight);
                  },
                  icon: Icon(Icons.arrow_back_ios,color: ColorData.whitecolor,),
                ),
                Spacer(),
                Expanded(
                  child: TextThemedel(
                    text: imagename ?? "Image Name",
                    color: ColorData.whitecolor,
                    fontSize: 20,
                    textoverflow: TextOverflow.ellipsis,
                  ),
                ),
                Spacer(),
              ],
            ),
            Expanded(
              child: PhotoView(
                imageProvider: NetworkImage(
                  image ??
                      "https://plus.unsplash.com/premium_photo-1664305032567-2c460e29dec1?q=80&w=1968&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                ),
                onTapUp: (context, details, controllerValue) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Image tapped!")),
                  );
                },
                enableRotation: true,
                minScale: PhotoViewComputedScale.contained,
                maxScale: PhotoViewComputedScale.covered * 3,
                initialScale: PhotoViewComputedScale.contained * 1.0,
                heroAttributes: const PhotoViewHeroAttributes(
                  tag: "photoHero",
                ),
                backgroundDecoration: BoxDecoration(
                  color: ColorData.textblackcolor,
                ),
                loadingBuilder: (context, progress) => Center(
                  child: CircularProgressIndicator(
                    value: progress == null
                        ? null
                        : progress.cumulativeBytesLoaded /
                            (progress.expectedTotalBytes ?? 1),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
