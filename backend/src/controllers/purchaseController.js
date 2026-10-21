const PurchaseRequest = require('../models/PurchaseRequest');

// @desc    Get purchase requests for current role/user
// @route   GET /api/purchase-requests/mine
// @access  Private (purchase, admin, projectmanager)
const getMyPurchaseRequests = async (req, res) => {
  try {
    const { status, limit } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const query = PurchaseRequest.find(filter)
      .populate({
        path: 'workOrderId',
        select: 'refCode clientName siteAddress roofModel span length grandTotal status'
      })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));

    const requests = await query.exec();
    const pendingCount = await PurchaseRequest.countDocuments({ status: 'pending' });
    const approvedCount = await PurchaseRequest.countDocuments({ status: 'approved' });
    const orderedCount = await PurchaseRequest.countDocuments({ status: 'ordered' });
    const receivedCount = await PurchaseRequest.countDocuments({ status: 'received' });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        ordered: orderedCount,
        received: receivedCount
      }
    });
  } catch (error) {
    console.error('Error fetching my purchase requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase requests',
      error: error.message
    });
  }
};

// @desc    Get all purchase requests
// @route   GET /api/purchase-requests
// @access  Private (admin, projectmanager, purchase)
const getAllPurchaseRequests = async (req, res) => {
  try {
    const { status, search, limit } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const query = PurchaseRequest.find(filter)
      .populate({
        path: 'workOrderId',
        select: 'refCode clientName siteAddress roofModel span length grandTotal status'
      })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));

    let requests = await query.exec();

    if (search && search.trim()) {
      const q = search.toLowerCase();
      requests = requests.filter(
        (pr) =>
          (pr.refCode && pr.refCode.toLowerCase().includes(q)) ||
          (pr.supplierName && pr.supplierName.toLowerCase().includes(q)) ||
          (pr.workOrderId?.refCode && pr.workOrderId.refCode.toLowerCase().includes(q)) ||
          (pr.workOrderId?.clientName && pr.workOrderId.clientName.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching all purchase requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase requests',
      error: error.message
    });
  }
};

// @desc    Update purchase request
// @route   PATCH /api/purchase-requests/:id
// @access  Private (purchase, admin, projectmanager)
const updatePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, supplierName, totalEstimate, notes, items } = req.body;

    const request = await PurchaseRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Purchase request not found'
      });
    }

    if (status) request.status = status;
    if (supplierName !== undefined) request.supplierName = supplierName;
    if (totalEstimate !== undefined) request.totalEstimate = Number(totalEstimate);
    if (notes !== undefined) request.notes = notes;
    if (items) request.items = items;

    await request.save();

    const populated = await PurchaseRequest.findById(id)
      .populate('workOrderId', 'refCode clientName')
      .populate('assignedTo', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Purchase request updated successfully',
      data: populated
    });
  } catch (error) {
    console.error('Error updating purchase request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update purchase request',
      error: error.message
    });
  }
};

module.exports = {
  getMyPurchaseRequests,
  getAllPurchaseRequests,
  updatePurchaseRequest
};
