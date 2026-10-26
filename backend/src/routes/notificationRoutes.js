const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');

router.use(protect);
router.get('/', getNotifications);
router.patch('/mark-all-read', markAllRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
