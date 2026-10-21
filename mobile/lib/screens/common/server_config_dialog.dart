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

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Row(
        children: [
          Icon(Icons.dns_outlined, color: AppColors.primaryNavy),
          SizedBox(width: 8),
          Text('Server Configuration', style: TextStyle(fontSize: 16)),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Configure your enterprise API gateway URL for connecting to local Wi-Fi or cloud staging:',
            style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _controller,
            decoration: InputDecoration(
              labelText: 'API Base URL',
              hintText: 'http://192.168.1.5:5000/api',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              TextButton(
                onPressed: () => _controller.text = 'http://10.0.2.2:5000/api',
                child: const Text('Android Emulator (10.0.2.2)', style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
        ],
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
                  const SnackBar(content: Text('API Gateway URL updated')),
                );
              }
            }
          },
          child: const Text('Save Server', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}
