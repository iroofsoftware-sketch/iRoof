const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  recordPayment,
  getPaymentsByInvoice,
  deletePayment
} = require('../controllers/paymentController');

router.use(protect);

router.post('/', authorize('admin', 'accounts'), recordPayment);
router.get('/', authorize('admin', 'accounts'), getPaymentsByInvoice);
router.delete('/:id', authorize('admin'), deletePayment);

module.exports = router;
