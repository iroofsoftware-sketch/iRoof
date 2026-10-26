import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../services/api_service.dart';

class ServerConfigDialog extends StatefulWidget {
  const ServerConfigDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (_) => const ServerConfigDialog(),
    );
  }

  @override
  State<ServerConfigDialog> createState() => _ServerConfigDialogState();
}

class _ServerConfigDialogState extends State<ServerConfigDialog> {
  final _controller = TextEditingController();
  bool _testing = false;
  String? _testResult;
  bool _isSuccess = false;

  @override
  void initState() {
    super.initState();
    ApiService.getBaseUrl().then((val) {
      if (mounted) setState(() => _controller.text = val);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _testPing() async {
    setState(() {
      _testing = true;
      _testResult = null;
    });

    final ok = await ApiService.testConnection(_controller.text.trim());
    if (!mounted) return;

    setState(() {
      _testing = false;
      _isSuccess = ok;
      _testResult = ok
          ? 'Connected! Backend API responded with 200 OK.'
          : 'Unable to connect. Check that phone is on same Wi-Fi and port 5000 is open.';
    });
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Row(
        children: [
          Icon(Icons.dns_outlined, color: AppColors.primaryNavy),
          SizedBox(width: 8),
          Text('Server Gateway', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter the backend server address. For real devices on Wi-Fi, use your computer\'s local network IP:',
              style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _controller,
              decoration: InputDecoration(
                labelText: 'API Gateway URL',
                hintText: 'http://192.168.1.35:5000/api',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              ),
            ),
            const SizedBox(height: 10),

            // Quick Preset Buttons
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                ActionChip(
                  label: const Text('Wi-Fi PC (192.168.1.35)', style: TextStyle(fontSize: 11)),
                  onPressed: () => setState(() => _controller.text = 'http://192.168.1.35:5000/api'),
                ),
                ActionChip(
                  label: const Text('Emulator (10.0.2.2)', style: TextStyle(fontSize: 11)),
                  onPressed: () => setState(() => _controller.text = 'http://10.0.2.2:5000/api'),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Test Ping Button
            OutlinedButton.icon(
              onPressed: _testing ? null : _testPing,
              icon: _testing
                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.bolt, size: 16),
              label: Text(_testing ? 'Pinging...' : 'Test Backend Connection'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryNavy,
                side: const BorderSide(color: AppColors.primaryNavy),
              ),
            ),

            if (_testResult != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: _isSuccess ? Colors.green.shade50 : Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _isSuccess ? Colors.green : Colors.amber.shade800),
                ),
                child: Row(
                  children: [
                    Icon(
                      _isSuccess ? Icons.check_circle : Icons.warning_amber_rounded,
                      color: _isSuccess ? Colors.green : Colors.amber.shade900,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _testResult!,
                        style: TextStyle(
                          fontSize: 11.5,
                          color: _isSuccess ? Colors.green.shade900 : Colors.amber.shade900,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryNavy),
          onPressed: () async {
            if (_controller.text.trim().isNotEmpty) {
              await ApiService.setBaseUrl(_controller.text.trim());
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Server Gateway saved')),
                );
              }
            }
          },
          child: const Text('Save Gateway', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}
