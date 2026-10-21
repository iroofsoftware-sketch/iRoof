const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrderStats
} = require('../controllers/purchaseOrderController');

router.use(protect);

router.post('/', authorize('admin', 'purchase'), createPurchaseOrder);
router.get('/stats', authorize('admin', 'purchase'), getPurchaseOrderStats);
router.get('/', authorize('admin', 'purchase'), getPurchaseOrders);
router.get('/:id', authorize('admin', 'purchase'), getPurchaseOrderById);
router.patch('/:id', authorize('admin', 'purchase'), updatePurchaseOrder);

module.exports = router;
