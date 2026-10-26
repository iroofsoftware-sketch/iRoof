const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
  getNotifications,
  markNotificationRead,
  markAllRead
} = require('../controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.post('/mark-all-read', markAllRead);

module.exports = router;
