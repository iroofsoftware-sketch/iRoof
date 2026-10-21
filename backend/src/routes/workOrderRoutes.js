const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats
} = require('../controllers/workOrderController');

router.use(protect);

router.post('/', authorize('admin', 'projectmanager'), createWorkOrder);
router.get('/stats', authorize('admin', 'projectmanager'), getWorkOrderStats);
router.get('/', authorize('admin', 'projectmanager'), getWorkOrders);
router.get('/:id', authorize('admin', 'projectmanager'), getWorkOrderById);
router.patch('/:id', authorize('admin', 'projectmanager'), updateWorkOrder);
router.delete('/:id', authorize('admin'), deleteWorkOrder);

module.exports = router;
