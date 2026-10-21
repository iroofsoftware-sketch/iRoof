const WorkshopJob = require('../models/WorkshopJob');

// @desc    Get workshop jobs for current user/role
// @route   GET /api/workshop-jobs/mine
// @access  Private (workshop, admin, projectmanager)
const getMyWorkshopJobs = async (req, res) => {
  try {
    const { status, limit } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const query = WorkshopJob.find(filter)
      .populate({
        path: 'workOrderId',
        select: 'refCode clientName siteAddress roofModel span length height status targetDate'
      })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));

    const jobs = await query.exec();
    const inProgressCount = await WorkshopJob.countDocuments({ status: 'in_progress' });
    const completedCount = await WorkshopJob.countDocuments({ status: 'completed' });
    const materialReadyCount = await WorkshopJob.countDocuments({ status: 'material_ready' });
    const pendingCount = await WorkshopJob.countDocuments({ status: 'pending' });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
      stats: {
        inProgress: inProgressCount,
        completed: completedCount,
        materialReady: materialReadyCount,
        pending: pendingCount
      }
    });
  } catch (error) {
    console.error('Error fetching my workshop jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve workshop jobs',
      error: error.message
    });
  }
};

// @desc    Get all workshop jobs
// @route   GET /api/workshop-jobs
// @access  Private (admin, projectmanager, workshop)
const getAllWorkshopJobs = async (req, res) => {
  try {
    const { status, search, limit } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const query = WorkshopJob.find(filter)
      .populate({
        path: 'workOrderId',
        select: 'refCode clientName siteAddress roofModel span length height status targetDate'
      })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));

    let jobs = await query.exec();

    if (search && search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          (j.refCode && j.refCode.toLowerCase().includes(q)) ||
          (j.title && j.title.toLowerCase().includes(q)) ||
          (j.workOrderId?.refCode && j.workOrderId.refCode.toLowerCase().includes(q)) ||
          (j.workOrderId?.clientName && j.workOrderId.clientName.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching all workshop jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve workshop jobs',
      error: error.message
    });
  }
};

// @desc    Update workshop job
// @route   PATCH /api/workshop-jobs/:id
// @access  Private (workshop, admin)
const updateWorkshopJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, startDate, endDate, notes, assignedTo } = req.body;

    const job = await WorkshopJob.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Workshop job not found'
      });
    }

    if (status) job.status = status;
    if (startDate !== undefined) job.startDate = startDate;
    if (endDate !== undefined) job.endDate = endDate;
    if (notes !== undefined) job.notes = notes;
    if (assignedTo !== undefined) job.assignedTo = assignedTo || req.user._id;

    await job.save();

    const populated = await WorkshopJob.findById(id)
      .populate('workOrderId', 'refCode clientName')
      .populate('assignedTo', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Workshop job updated successfully',
      data: populated
    });
  } catch (error) {
    console.error('Error updating workshop job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update workshop job',
      error: error.message
    });
  }
};

module.exports = {
  getMyWorkshopJobs,
  getAllWorkshopJobs,
  updateWorkshopJob
};
