const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const {
  getMyDesignTasks,
  getAllDesignTasks,
  updateDesignTask
} = require('../controllers/designTaskController');

router.use(protect);

router.get('/mine', authorize('design', 'admin', 'projectmanager'), getMyDesignTasks);
router.get('/', authorize('admin', 'projectmanager', 'design'), getAllDesignTasks);
router.patch('/:id', authorize('design', 'admin', 'projectmanager'), updateDesignTask);

module.exports = router;
