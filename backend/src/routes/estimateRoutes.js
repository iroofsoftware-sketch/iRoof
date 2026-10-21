const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  saveEstimate,
  getEstimateById,
  getEstimates,
  updateEstimate,
  deleteEstimate
} = require('../controllers/estimateController');

// All estimate routes require authentication
router.use(protect);

router.post('/', saveEstimate);
router.get('/', getEstimates);
router.get('/:id', getEstimateById);
router.put('/:id', updateEstimate);
router.delete('/:id', authorize('admin', 'sales'), deleteEstimate);

module.exports = router;
