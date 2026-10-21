const SiteVisit = require('../models/SiteVisit');

// @desc    Get site visits for current user/role
// @route   GET /api/site-visits/mine
// @access  Private (sitevisitor, admin, projectmanager)
const getMySiteVisits = async (req, res) => {
  try {
    const { status, limit } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const query = SiteVisit.find(filter)
      .populate({
        path: 'workOrderId',
        select: 'refCode clientName siteAddress roofModel span length grandTotal status targetDate'
      })
      .populate('assignedTo', 'name email')
      .sort({ scheduledDate: 1, createdAt: -1 });

    if (limit) query.limit(Number(limit));

    const visits = await query.exec();
    const scheduledCount = await SiteVisit.countDocuments({ status: 'scheduled' });
    const inProgressCount = await SiteVisit.countDocuments({ status: 'in_progress' });
    const completedCount = await SiteVisit.countDocuments({ status: 'completed' });

    return res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
      stats: {
        scheduled: scheduledCount,
        inProgress: inProgressCount,
        completed: completedCount
      }
    });
  } catch (error) {
    console.error('Error fetching my site visits:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve site visits',
      error: error.message
    });
  }
};

// @desc    Get all site visits
// @route   GET /api/site-visits
// @access  Private (admin, projectmanager, sitevisitor)
const getAllSiteVisits = async (req, res) => {
  try {
    const { status, search, limit } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const query = SiteVisit.find(filter)
      .populate({
        path: 'workOrderId',
        select: 'refCode clientName siteAddress roofModel span length grandTotal status targetDate'
      })
      .populate('assignedTo', 'name email')
      .sort({ scheduledDate: 1, createdAt: -1 });

    if (limit) query.limit(Number(limit));

    let visits = await query.exec();

    if (search && search.trim()) {
      const q = search.toLowerCase();
      visits = visits.filter(
        (v) =>
          (v.refCode && v.refCode.toLowerCase().includes(q)) ||
          (v.workOrderId?.refCode && v.workOrderId.refCode.toLowerCase().includes(q)) ||
          (v.workOrderId?.clientName && v.workOrderId.clientName.toLowerCase().includes(q)) ||
          (v.workOrderId?.siteAddress && v.workOrderId.siteAddress.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: visits.length,
      data: visits
    });
  } catch (error) {
    console.error('Error fetching all site visits:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve site visits',
      error: error.message
    });
  }
};

// @desc    Update site visit
// @route   PATCH /api/site-visits/:id
// @access  Private (sitevisitor, admin)
const updateSiteVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, report, notes, completedDate, scheduledDate, photos, assignedTo } = req.body;

    const visit = await SiteVisit.findById(id);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Site visit not found'
      });
    }

    if (status) visit.status = status;
    if (report !== undefined) visit.report = report;
    if (notes !== undefined) visit.notes = notes;
    if (completedDate !== undefined) visit.completedDate = completedDate;
    if (scheduledDate !== undefined) visit.scheduledDate = scheduledDate;
    if (photos) visit.photos = photos;
    if (assignedTo !== undefined) visit.assignedTo = assignedTo || req.user._id;

    await visit.save();

    const populated = await SiteVisit.findById(id)
      .populate('workOrderId', 'refCode clientName siteAddress')
      .populate('assignedTo', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Site visit updated successfully',
      data: populated
    });
  } catch (error) {
    console.error('Error updating site visit:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update site visit',
      error: error.message
    });
  }
};

module.exports = {
  getMySiteVisits,
  getAllSiteVisits,
  updateSiteVisit
};
