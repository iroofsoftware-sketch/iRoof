const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getMyPurchaseRequests,
  getAllPurchaseRequests,
  updatePurchaseRequest
} = require('../controllers/purchaseController');

router.use(protect);

router.get('/mine', authorize('purchase', 'admin', 'projectmanager'), getMyPurchaseRequests);
router.get('/', authorize('admin', 'projectmanager', 'purchase'), getAllPurchaseRequests);
router.patch('/:id', authorize('purchase', 'admin'), updatePurchaseRequest);

module.exports = router;
