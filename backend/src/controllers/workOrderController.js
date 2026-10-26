const WorkOrder = require('../models/WorkOrder');
const DesignTask = require('../models/DesignTask');
const PurchaseRequest = require('../models/PurchaseRequest');
const WorkshopJob = require('../models/WorkshopJob');
const SiteVisit = require('../models/SiteVisit');
const Estimate = require('../models/Estimate');
const { Enquiry } = require('../models/Enquiry');
const Notification = require('../models/Notification');

// Helper: create notification
const notify = async ({ title, message, type = 'info', targetRoles, relatedId, createdBy }) => {
  try {
    await Notification.create({ title, message, type, targetRoles, relatedId, relatedModel: 'WorkOrder', createdBy });
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// @desc    Get all work orders
// @route   GET /api/workorders
// @access  Private (admin, projectmanager, accounts, design, purchase, workshop)
const getWorkOrders = async (req, res) => {
  try {
    const { status, priority, search, limit, page } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;

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
      .populate('stageHistory.performedBy', 'name')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));
    if (page && limit) query.skip((Number(page) - 1) * Number(limit));

    const [workOrders, total] = await Promise.all([
      query.exec(),
      WorkOrder.countDocuments(filter)
    ]);

    return res.status(200).json({ success: true, count: workOrders.length, total, data: workOrders });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get work order stats
// @route   GET /api/workorders/stats
const getWorkOrderStats = async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$grandTotal' } } }
    ];
    const stats = await WorkOrder.aggregate(pipeline);
    const total = await WorkOrder.countDocuments();
    const totalValue = await WorkOrder.aggregate([{ $group: { _id: null, sum: { $sum: '$grandTotal' } } }]);

    return res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        total,
        totalPipelineValue: totalValue[0]?.sum || 0,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single work order
// @route   GET /api/workorders/:id
const getWorkOrderById = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id)
      .populate('enquiryId')
      .populate('estimateId')
      .populate('createdBy', 'name email role')
      .populate('assignedPM', 'name email')
      .populate('accountsApproval.approvedBy', 'name')
      .populate('materialsVerified.verifiedBy', 'name')
      .populate('stageHistory.performedBy', 'name role')
      .populate('logNotes.addedBy', 'name role');

    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create work order (basic)
// @route   POST /api/workorders
const createWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update work order (basic patch)
// @route   PATCH /api/workorders/:id
const updateWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete work order
// @route   DELETE /api/workorders/:id
const deleteWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findByIdAndDelete(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    return res.status(200).json({ success: true, message: 'Work order deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── STAGE GATE ENDPOINTS ────────────────────────────────────────────────────

// GATE 1: Sales issues WO from estimate
// POST /api/workorders/issue-from-sales
const issueFromSales = async (req, res) => {
  try {
    const { estimateId, enquiryId, clientName, siteAddress, roofModel, grandTotal, span, length, height, priority, targetDate, notes, assignedPM } = req.body;

    const wo = await WorkOrder.create({
      estimateId, enquiryId, clientName, siteAddress, roofModel, grandTotal, span, length, height,
      priority, targetDate, notes, assignedPM,
      status: 'pending_accounts',
      createdBy: req.user._id,
      stageHistory: [{ stage: 'Gate 1', action: 'WO issued by Sales', performedBy: req.user._id, note: notes }],
    });

    // Update estimate status
    await Estimate.findByIdAndUpdate(estimateId, { status: 'work_order_issued' });

    await notify({ title: 'New Work Order Issued', message: `WO ${wo.refCode} for ${clientName} requires accounts approval.`, type: 'info', targetRoles: ['accounts', 'admin'], relatedId: wo._id, createdBy: req.user._id });

    return res.status(201).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GATE 2: Accounts approves WO
// POST /api/workorders/:id/accounts-approve
const accountsApprove = async (req, res) => {
  try {
    const { note } = req.body;
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    if (wo.status !== 'pending_accounts') return res.status(400).json({ success: false, message: `WO is not in pending_accounts state (current: ${wo.status})` });

    wo.status = 'accounts_approved';
    wo.accountsApproval = { approvedBy: req.user._id, approvedAt: new Date(), note };
    wo.stageHistory.push({ stage: 'Gate 2', action: 'Approved by Accounts', performedBy: req.user._id, note });
    await wo.save();

    await notify({ title: 'WO Accounts Approved', message: `${wo.refCode} approved — Design team please submit drawings.`, type: 'success', targetRoles: ['design', 'projectmanager', 'admin'], relatedId: wo._id, createdBy: req.user._id });

    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GATE 3: Design submits drawings + BOM
// POST /api/workorders/:id/design-submit
const designSubmit = async (req, res) => {
  try {
    const { materialList, drawingFiles, note } = req.body;
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    if (wo.status !== 'accounts_approved') return res.status(400).json({ success: false, message: `WO is not in accounts_approved state` });

    wo.status = 'design_submitted';
    if (materialList) wo.materialList = materialList;
    if (drawingFiles) wo.drawingFiles = drawingFiles;
    wo.stageHistory.push({ stage: 'Gate 3', action: 'Design & BOM submitted', performedBy: req.user._id, note });
    await wo.save();

    await notify({ title: 'Design Submitted', message: `${wo.refCode} design drawings ready for PM review.`, type: 'info', targetRoles: ['projectmanager', 'admin'], relatedId: wo._id, createdBy: req.user._id });

    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GATE 4: PM reviews design (approve → purchase, or revise → back to design)
// POST /api/workorders/:id/pm-review
const pmReview = async (req, res) => {
  try {
    const { action, revisionNotes, note } = req.body; // action: 'approve' | 'revise'
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    if (!['design_submitted', 'pm_review'].includes(wo.status)) return res.status(400).json({ success: false, message: 'WO not in reviewable state' });

    if (action === 'revise') {
      wo.status = 'accounts_approved'; // sends back to design
      wo.revisionNotes = revisionNotes;
      wo.stageHistory.push({ stage: 'Gate 4', action: 'PM requested revision', performedBy: req.user._id, note: revisionNotes || note });
      await wo.save();
      await notify({ title: 'Design Revision Requested', message: `${wo.refCode}: PM has requested design revision.`, type: 'warning', targetRoles: ['design', 'admin'], relatedId: wo._id, createdBy: req.user._id });
    } else {
      wo.status = 'pm_review'; // approved → ready for purchase
      wo.stageHistory.push({ stage: 'Gate 4', action: 'Design approved by PM', performedBy: req.user._id, note });
      await wo.save();
      await notify({ title: 'Design Approved by PM', message: `${wo.refCode} ready for purchase ordering.`, type: 'success', targetRoles: ['purchase', 'admin'], relatedId: wo._id, createdBy: req.user._id });
    }

    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GATE 5: Purchase confirms order placed
// POST /api/workorders/:id/purchase-ordered
const purchaseOrdered = async (req, res) => {
  try {
    const { note } = req.body;
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    if (wo.status !== 'pm_review') return res.status(400).json({ success: false, message: `WO is not in pm_review state` });

    wo.status = 'purchase_ordered';
    wo.stageHistory.push({ stage: 'Gate 5', action: 'Purchase order placed', performedBy: req.user._id, note });
    await wo.save();

    await notify({ title: 'Materials Ordered', message: `${wo.refCode}: Materials ordered. Workshop please verify GRN on delivery.`, type: 'info', targetRoles: ['workshop', 'admin'], relatedId: wo._id, createdBy: req.user._id });

    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GATE 6A: Workshop verifies material delivery (GRN)
// POST /api/workorders/:id/workshop-verify-materials
const workshopVerifyMaterials = async (req, res) => {
  try {
    const { note } = req.body;
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    if (wo.status !== 'purchase_ordered') return res.status(400).json({ success: false, message: 'WO not in purchase_ordered state' });

    wo.status = 'materials_verified';
    wo.materialsVerified = { verifiedBy: req.user._id, verifiedAt: new Date(), note };
    wo.stageHistory.push({ stage: 'Gate 6A', action: 'Materials GRN verified', performedBy: req.user._id, note });
    await wo.save();

    await notify({ title: 'Materials Verified (GRN)', message: `${wo.refCode}: Materials received and verified. Ready to start fabrication.`, type: 'success', targetRoles: ['projectmanager', 'admin', 'workshop'], relatedId: wo._id, createdBy: req.user._id });

    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GATE 6B: Workshop starts fabrication
// POST /api/workorders/:id/workshop-start-fabrication
const workshopStartFabrication = async (req, res) => {
  try {
    const { note } = req.body;
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    if (wo.status !== 'materials_verified') return res.status(400).json({ success: false, message: 'Materials not yet verified' });

    wo.status = 'fabrication';
    wo.stageHistory.push({ stage: 'Gate 6B', action: 'Fabrication started', performedBy: req.user._id, note });
    await wo.save();

    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GATE 7: Workshop marks complete
// POST /api/workorders/:id/workshop-complete
const workshopComplete = async (req, res) => {
  try {
    const { note } = req.body;
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });
    if (wo.status !== 'fabrication') return res.status(400).json({ success: false, message: 'WO not in fabrication state' });

    wo.status = 'completed';
    wo.stageHistory.push({ stage: 'Gate 7', action: 'Work completed', performedBy: req.user._id, note });
    await wo.save();

    await notify({ title: 'Work Order Completed! 🎉', message: `${wo.refCode} for ${wo.clientName} has been completed.`, type: 'success', targetRoles: ['admin', 'sales', 'accounts', 'projectmanager'], relatedId: wo._id, createdBy: req.user._id });

    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add attachments to WO
// PATCH /api/workorders/:id/attachments
const addAttachments = async (req, res) => {
  try {
    const { attachments } = req.body;
    const wo = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { $push: { attachments: { $each: attachments } } },
      { new: true }
    );
    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Log a note on WO
// POST /api/workorders/:id/log-note
const logNote = async (req, res) => {
  try {
    const { text } = req.body;
    const wo = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { $push: { logNotes: { text, addedBy: req.user._id } } },
      { new: true }
    );
    return res.status(200).json({ success: true, data: wo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder, getWorkOrderStats,
  issueFromSales, accountsApprove, designSubmit, pmReview, purchaseOrdered,
  workshopVerifyMaterials, workshopStartFabrication, workshopComplete,
  addAttachments, logNote
};
