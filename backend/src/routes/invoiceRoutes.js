const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { getInvoices, getInvoiceById, createInvoice, updateInvoice, recordPayment } = require('../controllers/invoiceController');

router.use(protect);
router.get('/', authorize('admin', 'accounts'), getInvoices);
router.get('/:id', authorize('admin', 'accounts'), getInvoiceById);
router.post('/', authorize('admin', 'accounts'), createInvoice);
router.patch('/:id', authorize('admin', 'accounts'), updateInvoice);
router.post('/:id/payment', authorize('admin', 'accounts'), recordPayment);

module.exports = router;
