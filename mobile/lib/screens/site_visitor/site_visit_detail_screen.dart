import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../constants/app_colors.dart';
import '../../services/api_service.dart';
import '../../services/location_service.dart';

class SiteVisitDetailScreen extends StatefulWidget {
  final Map<String, dynamic> visit;

  const SiteVisitDetailScreen({super.key, required this.visit});

  @override
  State<SiteVisitDetailScreen> createState() => _SiteVisitDetailScreenState();
}

class _SiteVisitDetailScreenState extends State<SiteVisitDetailScreen> {
  final _spanCtrl = TextEditingController();
  final _lenCtrl = TextEditingController();
  final _riseCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

  String _substructure = 'RCC Girders / Beams';
  String _foundationStatus = 'Adequate Load Capacity';
  final List<XFile> _localPhotos = [];
  Position? _capturedPosition;
  bool _submitting = false;
  bool _gettingGps = false;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final v = widget.visit;
    if (v['span'] != null) _spanCtrl.text = v['span'].toString();
    if (v['length'] != null) _lenCtrl.text = v['length'].toString();
    if (v['rise'] != null) _riseCtrl.text = v['rise'].toString();
    if (v['notes'] != null) _notesCtrl.text = v['notes'].toString();
    _fetchGps();
  }

  @override
  void dispose() {
    _spanCtrl.dispose();
    _lenCtrl.dispose();
    _riseCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchGps() async {
    setState(() => _gettingGps = true);
    final pos = await LocationService.getCurrentLocation();
    if (!mounted) return;
    setState(() {
      _capturedPosition = pos;
      _gettingGps = false;
    });
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final img = await _picker.pickImage(source: source, imageQuality: 80);
      if (img != null) {
        setState(() => _localPhotos.add(img));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not access camera/gallery: $e')),
        );
      }
    }
  }

  Future<void> _handleSubmit() async {
    final visitId = widget.visit['_id'] ?? widget.visit['id'] ?? '';
    if (visitId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid Site Visit Identifier')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      // 1. Upload any new photos
      final photoRecords = <Map<String, dynamic>>[];
      for (final p in _localPhotos) {
        final url = await ApiService.uploadPhoto(p);
        if (url != null) {
          photoRecords.add({
            'url': url,
            'caption': 'Field Inspection Photo',
            'uploadedAt': DateTime.now().toIso8601String(),
          });
        }
      }

      // 2. Prepare GPS String
      final gpsString = LocationService.formatPosition(_capturedPosition);

      // 3. Format Field Report
      final reportSummary = '''
=== ON-SITE FIELD INSPECTION REPORT ===
GPS Location: $gpsString
Substructure / Foundation: $_substructure ($_foundationStatus)
Clear Span: ${_spanCtrl.text.trim()} m
Arch Length: ${_lenCtrl.text.trim()} m
Arch Rise: ${_riseCtrl.text.trim()} m
Inspector Notes: ${_notesCtrl.text.trim()}
Submitted At: ${DateTime.now().toLocal()}
''';

      final ok = await ApiService.submitSiteInspectionReport(
        visitId: visitId,
        report: reportSummary,
        notes: _notesCtrl.text.trim(),
        photos: photoRecords,
        status: 'completed',
        extraMeasurements: {
          'span': double.tryParse(_spanCtrl.text.trim()) ?? 0,
          'length': double.tryParse(_lenCtrl.text.trim()) ?? 0,
          'rise': double.tryParse(_riseCtrl.text.trim()) ?? 0,
          'substructure': _substructure,
          'gps': gpsString,
        },
      );

      if (!mounted) return;

      if (ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF10B981),
            content: Text('Site inspection submitted & marked complete!'),
          ),
        );
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit report to server')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error submitting report: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final v = widget.visit;
    final ref = v['refCode'] ?? 'SV';
    final client = v['clientName'] ?? 'Client Name';
    final address = v['siteAddress'] ?? 'Site Location';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(ref, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17)),
        backgroundColor: AppColors.primaryNavy,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Client & Site Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(client, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Expanded(child: Text(address, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary))),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    children: [
                      Icon(Icons.gps_fixed, size: 16, color: _capturedPosition != null ? AppColors.successGreen : Colors.orange),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          _gettingGps
                              ? 'Acquiring GPS coordinates...'
                              : LocationService.formatPosition(_capturedPosition),
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: _capturedPosition != null ? Colors.green.shade800 : Colors.orange.shade800,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.refresh, size: 16),
                        onPressed: _fetchGps,
                        tooltip: 'Refresh GPS',
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 1. Site Measurements
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('1. Clear Measurements', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _spanCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'Clear Span (m) *', border: OutlineInputBorder(), suffixText: 'm'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _lenCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'Length (m) *', border: OutlineInputBorder(), suffixText: 'm'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _riseCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Arch Rise Height (m)', border: OutlineInputBorder(), suffixText: 'm'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 2. Foundation & Substructure
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('2. Foundation & Substructure Status', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _substructure,
                    decoration: const InputDecoration(labelText: 'Column / Wall Type', border: OutlineInputBorder()),
                    items: [
                      'RCC Girders / Beams',
                      'Steel Stanchions / Columns',
                      'Masonry Wall Plates',
                      'Greenfield Ground Setup',
                    ].map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _substructure = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _foundationStatus,
                    decoration: const InputDecoration(labelText: 'Foundation Structural Status', border: OutlineInputBorder()),
                    items: [
                      'Adequate Load Capacity',
                      'Needs Reinforced Anchor Plates',
                      'Leveling Required (+/- 50mm)',
                      'Foundation Pending Construction',
                    ].map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _foundationStatus = val);
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 3. Site Photos (Camera + Gallery)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('3. Site Photos', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                      Text('${_localPhotos.length} photos added', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickImage(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt_outlined, size: 18),
                          label: const Text('Take Photo', style: TextStyle(fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primaryNavy,
                            side: const BorderSide(color: AppColors.primaryNavy),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickImage(ImageSource.gallery),
                          icon: const Icon(Icons.photo_library_outlined, size: 18),
                          label: const Text('Gallery', style: TextStyle(fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primaryNavy,
                            side: const BorderSide(color: AppColors.border),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (_localPhotos.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 80,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _localPhotos.length,
                        separatorBuilder: (context, index) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final file = _localPhotos[index];
                          return Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: kIsWeb
                                    ? Container(width: 80, height: 80, color: Colors.grey.shade300, child: const Icon(Icons.image))
                                    : Image.file(File(file.path), width: 80, height: 80, fit: BoxFit.cover),
                              ),
                              Positioned(
                                top: 2,
                                right: 2,
                                child: InkWell(
                                  onTap: () => setState(() => _localPhotos.removeAt(index)),
                                  child: Container(
                                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.black54),
                                    padding: const EdgeInsets.all(2),
                                    child: const Icon(Icons.close, size: 14, color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 4. Notes
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('4. Engineering Observations & Notes', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _notesCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Enter crane access constraints, soil quality, or timeline observations...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Submit Button
            ElevatedButton.icon(
              onPressed: _submitting ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.successGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: _submitting
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.check_circle_outline),
              label: Text(
                _submitting ? 'Submitting Field Report...' : 'Submit & Complete Site Visit',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
