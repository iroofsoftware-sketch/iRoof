const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
} = require('../controllers/adminUserController');
const {
  getRates,
  createRate,
  updateRate,
  deleteRate,
  getSections,
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/rateController');

// User Management Routes (Admin only)
router.get('/users', authorize('admin'), getUsers);
router.post('/users', authorize('admin'), createUser);
router.put('/users/:id', authorize('admin'), updateUser);
router.patch('/users/:id/toggle', authorize('admin'), toggleUserStatus);
router.delete('/users/:id', authorize('admin'), deleteUser);

// Rate Master Routes — Read accessible to sales & ops for estimation calculations; write admin-only
const READ_RATES_ROLES = ['admin', 'sales', 'projectmanager', 'accounts', 'design'];
router.get('/rates', authorize(...READ_RATES_ROLES), getRates);
router.post('/rates', authorize('admin'), createRate);
router.put('/rates/:id', authorize('admin'), updateRate);
router.patch('/rates/:id', authorize('admin'), updateRate);
router.delete('/rates/:id', authorize('admin'), deleteRate);

// Section Master Routes — Read accessible to sales & engineering; write admin-only
router.get('/sections', authorize(...READ_RATES_ROLES), getSections);
router.post('/sections', authorize('admin'), createSection);
router.put('/sections/:id', authorize('admin'), updateSection);
router.delete('/sections/:id', authorize('admin'), deleteSection);

module.exports = router;
