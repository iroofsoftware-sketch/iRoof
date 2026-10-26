const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

router.use(protect);

router.post('/', authorize('admin'), createSupplier);
router.get('/', authorize('admin', 'purchase'), getSuppliers);
router.get('/:id', authorize('admin', 'purchase'), getSupplierById);
router.patch('/:id', authorize('admin'), updateSupplier);
router.delete('/:id', authorize('admin'), deleteSupplier);

module.exports = router;
