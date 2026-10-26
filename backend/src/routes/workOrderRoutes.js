const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder, getWorkOrderStats,
  issueFromSales, accountsApprove, designSubmit, pmReview, purchaseOrdered,
  workshopVerifyMaterials, workshopStartFabrication, workshopComplete,
  addAttachments, logNote
} = require('../controllers/workOrderController');

router.use(protect);

// Stats & lists
router.get('/stats', authorize('admin', 'projectmanager', 'accounts'), getWorkOrderStats);
router.get('/', authorize('admin', 'projectmanager', 'accounts', 'design', 'purchase', 'workshop'), getWorkOrders);
router.get('/:id', authorize('admin', 'projectmanager', 'accounts', 'design', 'purchase', 'workshop', 'sitevisitor'), getWorkOrderById);

// Basic CRUD
router.post('/', authorize('admin', 'projectmanager'), createWorkOrder);
router.patch('/:id', authorize('admin', 'projectmanager'), updateWorkOrder);
router.delete('/:id', authorize('admin'), deleteWorkOrder);

// Stage-gate endpoints
router.post('/issue-from-sales', authorize('admin', 'sales'), issueFromSales);
router.post('/:id/accounts-approve', authorize('admin', 'accounts'), accountsApprove);
router.post('/:id/design-submit', authorize('admin', 'design'), designSubmit);
router.post('/:id/pm-review', authorize('admin', 'projectmanager'), pmReview);
router.post('/:id/purchase-ordered', authorize('admin', 'purchase'), purchaseOrdered);
router.post('/:id/workshop-verify-materials', authorize('admin', 'workshop'), workshopVerifyMaterials);
router.post('/:id/workshop-start-fabrication', authorize('admin', 'workshop'), workshopStartFabrication);
router.post('/:id/workshop-complete', authorize('admin', 'workshop'), workshopComplete);

// Utility
router.patch('/:id/attachments', authorize('admin', 'projectmanager', 'design', 'workshop'), addAttachments);
router.post('/:id/log-note', protect, logNote);

module.exports = router;
