const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats
} = require('../controllers/invoiceController');

router.use(protect);

router.post('/', authorize('admin', 'accounts'), createInvoice);
router.get('/stats', authorize('admin', 'accounts'), getInvoiceStats);
router.get('/', authorize('admin', 'accounts'), getInvoices);
router.get('/:id', authorize('admin', 'accounts'), getInvoiceById);
router.patch('/:id', authorize('admin', 'accounts'), updateInvoice);
router.delete('/:id', authorize('admin'), deleteInvoice);

module.exports = router;
