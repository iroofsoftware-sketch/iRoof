const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const protect = require('../middleware/protect');

router.use(protect);

router
  .route('/')
  .get(customerController.getCustomers)
  .post(customerController.createCustomer);

router.post('/sync', customerController.syncFromExisting);

router
  .route('/:id')
  .get(customerController.getCustomerById)
  .put(customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

module.exports = router;
