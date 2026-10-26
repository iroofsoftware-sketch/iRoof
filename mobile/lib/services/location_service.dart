import 'package:geolocator/geolocator.dart';

class LocationService {
  /// Safely gets the current GPS location with high or balanced accuracy.
  /// If permissions are denied or GPS is disabled, returns null gracefully.
  static Future<Position?> getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return null;
      }

      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 5),
        ),
      );
    } catch (_) {
      return null;
    }
  }

  /// Format position into human-readable string for reports
  static String formatPosition(Position? pos) {
    if (pos == null) return 'GPS unavailable (Offline / Indoors)';
    return 'Lat: ${pos.latitude.toStringAsFixed(6)}, Lng: ${pos.longitude.toStringAsFixed(6)} (±${pos.accuracy.toStringAsFixed(1)}m)';
  }
}
