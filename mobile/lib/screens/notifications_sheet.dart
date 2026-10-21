import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class NotificationsSheet extends StatefulWidget {
  const NotificationsSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const NotificationsSheet(),
    );
  }

  @override
  State<NotificationsSheet> createState() => _NotificationsSheetState();
}

class _NotificationsSheetState extends State<NotificationsSheet> {
  List<Map<String, dynamic>> _list = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    final data = await ApiService.getNotifications();
    if (!mounted) return;
    setState(() {
      _list = List<Map<String, dynamic>>.from(data['notifications'] ?? []);
      _loading = false;
    });
  }

  Future<void> _markRead(String id) async {
    await ApiService.markNotificationRead(id);
    if (!mounted) return;
    setState(() {
      final index = _list.indexWhere((n) => n['_id'] == id);
      if (index != -1) {
        _list[index]['isRead'] = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.notifications_active_outlined, color: AppColors.primaryNavy),
                    SizedBox(width: 8),
                    Text('Notifications', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: _fetch,
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _list.isEmpty
                    ? const Center(
                        child: Text('No notifications at this time', style: TextStyle(color: AppColors.textSecondary)),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetch,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _list.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final n = _list[index];
                            final isRead = n['isRead'] == true;
                            return InkWell(
                              onTap: () {
                                if (!isRead && n['_id'] != null) {
                                  _markRead(n['_id']);
                                }
                              },
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: isRead ? AppColors.surface : AppColors.accentGold.withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isRead ? AppColors.border : AppColors.accentGold.withValues(alpha: 0.4),
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Icon(
                                      isRead ? Icons.mark_email_read_outlined : Icons.mark_email_unread,
                                      color: isRead ? Colors.grey : AppColors.accentGold,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            n['title'] ?? 'Notice',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: isRead ? FontWeight.w600 : FontWeight.w800,
                                              color: AppColors.primaryNavy,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            n['message'] ?? '',
                                            style: const TextStyle(fontSize: 12.5, color: AppColors.textPrimary),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
