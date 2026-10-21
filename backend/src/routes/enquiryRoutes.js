const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry
} = require('../controllers/enquiryController');

// All enquiry routes require authenticated user
router.use(protect);

router.get('/', getEnquiries);
router.post('/', createEnquiry);
router.get('/:id', getEnquiryById);
router.put('/:id', updateEnquiry);
router.patch('/:id/status', updateEnquiryStatus);
router.delete('/:id', authorize('admin', 'sales'), deleteEnquiry);

module.exports = router;
