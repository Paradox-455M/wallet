const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

router.get('/', authController.protect, notificationController.getNotifications);
router.get('/unread-count', authController.protect, notificationController.getUnreadCount);
router.post('/read-all', authController.protect, notificationController.markAllAsRead);
router.post('/:notificationId/read', authController.protect, notificationController.markAsRead);

module.exports = router;
