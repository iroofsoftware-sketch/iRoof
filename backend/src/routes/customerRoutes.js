const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { getCustomers, getCustomerById, createCustomer, updateCustomer } = require('../controllers/customerController');

router.use(protect);
router.get('/', authorize('admin', 'sales', 'accounts', 'projectmanager'), getCustomers);
router.get('/:id', authorize('admin', 'sales', 'accounts', 'projectmanager'), getCustomerById);
router.post('/', authorize('admin', 'sales'), createCustomer);
router.patch('/:id', authorize('admin', 'sales'), updateCustomer);

module.exports = router;
