const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus
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

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User Management Routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle', toggleUserStatus);

// Rate Master Routes
router.get('/rates', getRates);
router.post('/rates', createRate);
router.put('/rates/:id', updateRate);
router.delete('/rates/:id', deleteRate);

// Section Master Routes
router.get('/sections', getSections);
router.post('/sections', createSection);
router.put('/sections/:id', updateSection);
router.delete('/sections/:id', deleteSection);

module.exports = router;
