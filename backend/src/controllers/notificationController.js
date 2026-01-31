const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const unreadOnly = req.query.unread === 'true';
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const notifications = await Notification.findByUserEmail(req.user.email, {
      limit,
      unreadOnly,
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const count = await Notification.getUnreadCount(req.user.email);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { notificationId } = req.params;
    const notification = await Notification.markAsRead(notificationId, req.user.email);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const count = await Notification.markAllAsRead(req.user.email);
    res.json({ marked: count });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};
