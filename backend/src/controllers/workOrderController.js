const WorkOrder = require('../models/WorkOrder');
const DesignTask = require('../models/DesignTask');
const PurchaseRequest = require('../models/PurchaseRequest');
const WorkshopJob = require('../models/WorkshopJob');
const SiteVisit = require('../models/SiteVisit');
const Estimate = require('../models/Estimate');
const { Enquiry } = require('../models/Enquiry');

// @desc    Get all work orders
// @route   GET /api/workorders
// @access  Private (admin, projectmanager)
const getWorkOrders = async (req, res) => {
  try {
    const { status, priority, search, limit, page } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { clientName: { $regex: q, $options: 'i' } },
        { refCode: { $regex: q, $options: 'i' } },
        { siteAddress: { $regex: q, $options: 'i' } }
      ];
    }

    const query = WorkOrder.find(filter)
      .populate('enquiryId', 'clientName phone email address roofType')
      .populate('estimateId', 'model inputData results status')
      .populate('createdBy', 'name email')
      .populate('assignedPM', 'name email')
      .sort({ createdAt: -1 });

    if (limit) {
      query.limit(Number(limit));
    }
    if (page && limit) {
      query.skip((Number(page) - 1) * Number(limit));
    }

    const [workOrders, total] = await Promise.all([
      query.exec(),
      WorkOrder.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: workOrders.length,
      total,
      data: workOrders
    });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve work orders',
      error: error.message
    });
  }
};

// @desc    Get single work order with all linked tasks
// @route   GET /api/workorders/:id
// @access  Private (admin, projectmanager)
const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findById(id)
      .populate('enquiryId', 'clientName phone email address roofType notes')
      .populate('estimateId')
      .populate('createdBy', 'name email')
      .populate('assignedPM', 'name email');

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    // Find linked child documents
    const [designTask, purchaseRequest, workshopJob, siteVisit] = await Promise.all([
      DesignTask.findOne({ workOrderId: workOrder._id }).populate('assignedTo', 'name email'),
      PurchaseRequest.findOne({ workOrderId: workOrder._id }).populate('assignedTo', 'name email'),
      WorkshopJob.findOne({ workOrderId: workOrder._id }).populate('assignedTo', 'name email'),
      SiteVisit.findOne({ workOrderId: workOrder._id }).populate('assignedTo', 'name email')
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...workOrder.toObject(),
        designTask,
        purchaseRequest,
        workshopJob,
        siteVisit
      }
    });
  } catch (error) {
    console.error('Error fetching work order by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve work order details',
      error: error.message
    });
  }
};

// @desc    Create new work order from an approved estimate
// @route   POST /api/workorders
// @access  Private (admin, projectmanager)
const createWorkOrder = async (req, res) => {
  try {
    const { estimateId, targetDate, priority, notes, assignedPM } = req.body;

    if (!estimateId) {
      return res.status(400).json({
        success: false,
        message: 'Estimate ID is required to create a work order'
      });
    }

    const estimate = await Estimate.findById(estimateId).populate('enquiryId');
    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Source estimate not found'
      });
    }

    const enquiry = estimate.enquiryId || {};
    const inputData = estimate.inputData || {};
    const results = estimate.results || {};
    const costs = results.costs || {};

    const clientName = enquiry.clientName || 'General Client';
    const siteAddress = enquiry.address || 'Site Location';
    const roofModel = estimate.model || 'Standard Model';
    const span = inputData.span || results.span || 0;
    const length = inputData.length || results.length || 0;
    const height = inputData.height || results.height || 0;
    const grandTotal = costs.grandTotal || costs.beforeGst || 0;

    // 1. Create Work Order
    const workOrder = new WorkOrder({
      enquiryId: estimate.enquiryId?._id || estimate.enquiryId,
      estimateId: estimate._id,
      clientName,
      siteAddress,
      roofModel,
      span,
      length,
      height,
      grandTotal,
      status: 'active',
      priority: priority || 'medium',
      targetDate: targetDate || undefined,
      notes: notes || '',
      createdBy: req.user._id,
      assignedPM: assignedPM || req.user._id
    });

    await workOrder.save();

    // 2. Auto-generate Design Task
    const designTask = await DesignTask.create({
      workOrderId: workOrder._id,
      title: `Structural Drawings — ${workOrder.refCode}`,
      description: `Prepare structural fabrication & erection drawings for ${roofModel} (${span}m x ${length}m)`,
      status: 'pending',
      dueDate: targetDate || undefined,
      createdBy: req.user._id
    });

    // 3. Auto-generate Purchase Request with prefilled materials
    const purchaseItems = [
      {
        name: `Roofing Sheets (${results.th || 0.6}mm BMT Profile)`,
        quantity: Math.round(results.sheetKg || (span * length * 4.5)),
        unit: 'kg',
        estimatedCost: costs.sheetCost || 0,
        notes: `${results.panels || 0} panels cut to ${results.finalCut?.toFixed(2) || 0}m`
      },
      {
        name: 'Structural Steel Sections & Tubes',
        quantity: Math.round(results.sheetKg || (span * length * 5)),
        unit: 'kg',
        estimatedCost: costs.labourCost || 0,
        notes: `${results.bays || 1} bays, ${results.ncol || 2} columns`
      },
      {
        name: 'Hardware, Fasteners & Silicone Sealants',
        quantity: 1,
        unit: 'set',
        estimatedCost: costs.consumables || 0,
        notes: 'Standard installation kit'
      }
    ];

    const purchaseRequest = await PurchaseRequest.create({
      workOrderId: workOrder._id,
      items: purchaseItems,
      status: 'pending',
      totalEstimate: grandTotal,
      notes: `Materials for ${roofModel}`,
      createdBy: req.user._id
    });

    // 4. Auto-generate Workshop Job
    const workshopJob = await WorkshopJob.create({
      workOrderId: workOrder._id,
      title: `Fabrication — ${workOrder.refCode}`,
      description: `Fabricate structural frames, trusses, and baseplates for ${clientName}`,
      status: 'pending',
      startDate: new Date(),
      endDate: targetDate || undefined,
      createdBy: req.user._id
    });

    // 5. Auto-generate Site Visit Schedule
    const siteVisit = await SiteVisit.create({
      workOrderId: workOrder._id,
      visitType: 'initial',
      scheduledDate: targetDate || new Date(),
      status: 'scheduled',
      notes: `Site kickoff & alignment check for ${clientName}`,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Work order created and child tasks generated successfully',
      workOrder,
      designTask,
      purchaseRequest,
      workshopJob,
      siteVisit
    });
  } catch (error) {
    console.error('Error creating work order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create work order',
      error: error.message
    });
  }
};

// @desc    Update work order
// @route   PATCH /api/workorders/:id
// @access  Private (admin, projectmanager)
const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, targetDate, notes, assignedPM } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    if (status) workOrder.status = status;
    if (priority) workOrder.priority = priority;
    if (targetDate !== undefined) workOrder.targetDate = targetDate;
    if (notes !== undefined) workOrder.notes = notes;
    if (assignedPM) workOrder.assignedPM = assignedPM;
    if (req.body.attachments !== undefined) workOrder.attachments = req.body.attachments;

    await workOrder.save();

    const populated = await WorkOrder.findById(id)
      .populate('enquiryId', 'clientName phone')
      .populate('assignedPM', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Work order updated successfully',
      data: populated
    });
  } catch (error) {
    console.error('Error updating work order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update work order',
      error: error.message
    });
  }
};

// @desc    Delete work order and cascade child documents
// @route   DELETE /api/workorders/:id
// @access  Private (admin only)
const deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByIdAndDelete(id);
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    // Cascade delete child tasks
    await Promise.all([
      DesignTask.deleteMany({ workOrderId: id }),
      PurchaseRequest.deleteMany({ workOrderId: id }),
      WorkshopJob.deleteMany({ workOrderId: id }),
      SiteVisit.deleteMany({ workOrderId: id })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Work order and all associated tasks deleted'
    });
  } catch (error) {
    console.error('Error deleting work order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete work order',
      error: error.message
    });
  }
};

// @desc    Get work order stats
// @route   GET /api/workorders/stats
// @access  Private (admin, projectmanager)
const getWorkOrderStats = async (req, res) => {
  try {
    const [total, draft, active, on_hold, completed, cancelled] = await Promise.all([
      WorkOrder.countDocuments(),
      WorkOrder.countDocuments({ status: 'draft' }),
      WorkOrder.countDocuments({ status: 'active' }),
      WorkOrder.countDocuments({ status: 'on_hold' }),
      WorkOrder.countDocuments({ status: 'completed' }),
      WorkOrder.countDocuments({ status: 'cancelled' })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        draft,
        active,
        on_hold,
        completed,
        cancelled
      }
    });
  } catch (error) {
    console.error('Error fetching work order stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch work order stats',
      error: error.message
    });
  }
};

module.exports = {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats
};
