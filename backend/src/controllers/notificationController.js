const Notification = require('../models/Notification');

// Internal helper to create a notification from any controller
const createNotification = async ({
  recipientRole = 'all',
  recipientUser = null,
  title,
  message,
  type = 'info',
  link = '',
  refCode = '',
  createdBy = null
}) => {
  try {
    const notification = await Notification.create({
      recipientRole,
      recipientUser,
      title,
      message,
      type,
      link,
      refCode,
      createdBy
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification helper:', error);
    return null;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private (all logged in users)
const getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    // Admins see all notifications; other roles see their role or notifications specifically for them or 'all'
    let query = {};
    if (userRole !== 'admin') {
      query = {
        $or: [
          { recipientRole: userRole },
          { recipientRole: 'all' },
          { recipientUser: userId }
        ]
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const formatted = notifications.map((n) => {
      const isRead = Array.isArray(n.readBy) && n.readBy.some((r) => r.user?.toString() === userId.toString());
      return {
        ...n,
        isRead
      };
    });

    const unreadCount = formatted.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const alreadyRead = notification.readBy.some((r) => r.user?.toString() === userId.toString());
    if (!alreadyRead) {
      notification.readBy.push({ user: userId, readAt: new Date() });
      await notification.save();
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification read',
      error: error.message
    });
  }
};

// @desc    Mark all user's notifications as read
// @route   POST /api/notifications/mark-all-read
// @access  Private
const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = { 'readBy.user': { $ne: userId } };
    if (userRole !== 'admin') {
      query.$or = [
        { recipientRole: userRole },
        { recipientRole: 'all' },
        { recipientUser: userId }
      ];
    }

    await Notification.updateMany(query, {
      $push: { readBy: { user: userId, readAt: new Date() } }
    });

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications read',
      error: error.message
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllRead
};
