const Notification = require('../models/Notification');

// GET /api/notifications - get notifications for current user's role
const getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly } = req.query;
    const filter = {
      $or: [
        { targetRoles: req.user.role },
        { targetUser: req.user._id }
      ]
    };
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    return res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const n = await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() }, { new: true });
    return res.status(200).json({ success: true, data: n });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/mark-all-read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ targetRoles: req.user.role }, { targetUser: req.user._id }], isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllRead };
