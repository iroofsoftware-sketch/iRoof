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

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User Management Routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle', toggleUserStatus);

module.exports = router;
