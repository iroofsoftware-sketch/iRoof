const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getMySiteVisits,
  getAllSiteVisits,
  updateSiteVisit
} = require('../controllers/siteVisitController');

router.use(protect);

router.get('/mine', authorize('sitevisitor', 'admin', 'projectmanager'), getMySiteVisits);
router.get('/', authorize('admin', 'projectmanager', 'sitevisitor'), getAllSiteVisits);
router.patch('/:id', authorize('sitevisitor', 'admin'), updateSiteVisit);

module.exports = router;
