const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  accountsApprove,
  designSubmitDrawings,
  pmReview,
  purchaseMarkOrdered,
  workshopVerifyMaterials,
  workshopStartFabrication,
  workshopComplete,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats
} = require('../controllers/workOrderController');

router.use(protect);

// Reading work orders & stats — accessible to all operational roles
const ALL_OPS_ROLES = [
  'admin',
  'sales',
  'accounts',
  'design',
  'projectmanager',
  'purchase',
  'workshop',
  'sitevisitor'
];

router.get('/stats', authorize(...ALL_OPS_ROLES), getWorkOrderStats);
router.get('/', authorize(...ALL_OPS_ROLES), getWorkOrders);
router.get('/:id', authorize(...ALL_OPS_ROLES), getWorkOrderById);

// GATE 1: Sales issues Work Order & Approval to Accounts
router.post('/issue-from-sales', authorize('sales', 'admin', 'projectmanager'), createWorkOrder);
router.post('/', authorize('sales', 'admin', 'projectmanager'), createWorkOrder);

// GATE 2: Accounts confirms quotation & payment terms, releases to Design
router.post('/:id/accounts-approve', authorize('accounts', 'admin'), accountsApprove);

// GATE 3: Design submits drawings to Project Manager
router.post('/:id/design-submit', authorize('design', 'admin'), designSubmitDrawings);

// GATE 4: Project Manager reviews drawings & releases Material List (or requests revision)
router.post('/:id/pm-review', authorize('projectmanager', 'admin'), pmReview);

// GATE 5: Purchase orders materials from Suppliers
router.post('/:id/purchase-ordered', authorize('purchase', 'admin'), purchaseMarkOrdered);

// GATE 6A: Workshop verifies delivered materials against Material List
router.post('/:id/workshop-verify-materials', authorize('workshop', 'admin'), workshopVerifyMaterials);

// GATE 6B: Workshop starts fabrication / sheet production
router.post('/:id/workshop-start-fabrication', authorize('workshop', 'admin'), workshopStartFabrication);

// GATE 7: Workshop completes fabrication / Work Proceeds
router.post('/:id/workshop-complete', authorize('workshop', 'projectmanager', 'admin'), workshopComplete);

// General update & delete
router.patch('/:id', authorize('admin', 'projectmanager'), updateWorkOrder);
router.delete('/:id', authorize('admin'), deleteWorkOrder);

module.exports = router;
