const DesignTask = require('../models/DesignTask');

// @desc    Get design tasks for logged in design user (or all if unassigned)
// @route   GET /api/design-tasks/mine
// @access  Private (design, admin, projectmanager)
const getMyDesignTasks = async (req, res) => {
  try {
    const { status, limit } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    // If assigned to user or not yet assigned, or admin/pm viewing
    if (req.user.role === 'design') {
      filter.$or = [{ assignedTo: req.user._id }, { assignedTo: null }, { assignedTo: { $exists: false } }];
    }

    const query = DesignTask.find(filter)
      .populate({
        path: 'workOrderId',
        select: 'refCode clientName siteAddress roofModel span length height status targetDate'
      })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));

    const tasks = await query.exec();
    const pendingCount = await DesignTask.countDocuments({ status: 'pending' });
    const inProgressCount = await DesignTask.countDocuments({ status: 'in_progress' });
    const approvedCount = await DesignTask.countDocuments({ status: 'approved' });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      stats: {
        pending: pendingCount,
        inProgress: inProgressCount,
        approved: approvedCount
      }
    });
  } catch (error) {
    console.error('Error fetching my design tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve design tasks',
      error: error.message
    });
  }
};

// @desc    Get all design tasks
// @route   GET /api/design-tasks
// @access  Private (admin, projectmanager, design)
const getAllDesignTasks = async (req, res) => {
  try {
    const { status, search, limit } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const query = DesignTask.find(filter)
      .populate({
        path: 'workOrderId',
        select: 'refCode clientName siteAddress roofModel span length height status'
      })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));

    let tasks = await query.exec();

    if (search && search.trim()) {
      const q = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.refCode && t.refCode.toLowerCase().includes(q)) ||
          (t.workOrderId?.refCode && t.workOrderId.refCode.toLowerCase().includes(q)) ||
          (t.workOrderId?.clientName && t.workOrderId.clientName.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching all design tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve design tasks',
      error: error.message
    });
  }
};

// @desc    Update design task
// @route   PATCH /api/design-tasks/:id
// @access  Private (design, admin, projectmanager)
const updateDesignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, dueDate, assignedTo, drawingFiles } = req.body;

    const task = await DesignTask.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Design task not found'
      });
    }

    if (status) task.status = status;
    if (notes !== undefined) task.notes = notes;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || req.user._id;
    if (drawingFiles) task.drawingFiles = drawingFiles;

    await task.save();

    const populated = await DesignTask.findById(id)
      .populate('workOrderId', 'refCode clientName')
      .populate('assignedTo', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Design task updated successfully',
      data: populated
    });
  } catch (error) {
    console.error('Error updating design task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update design task',
      error: error.message
    });
  }
};

module.exports = {
  getMyDesignTasks,
  getAllDesignTasks,
  updateDesignTask
};
