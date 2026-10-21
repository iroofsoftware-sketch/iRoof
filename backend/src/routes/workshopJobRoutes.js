const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getMyWorkshopJobs,
  getAllWorkshopJobs,
  updateWorkshopJob
} = require('../controllers/workshopController');

router.use(protect);

router.get('/mine', authorize('workshop', 'admin', 'projectmanager'), getMyWorkshopJobs);
router.get('/', authorize('admin', 'projectmanager', 'workshop'), getAllWorkshopJobs);
router.patch('/:id', authorize('workshop', 'admin'), updateWorkshopJob);

module.exports = router;
