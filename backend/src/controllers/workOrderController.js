const WorkOrder = require('../models/WorkOrder');
const DesignTask = require('../models/DesignTask');
const PurchaseRequest = require('../models/PurchaseRequest');
const WorkshopJob = require('../models/WorkshopJob');
const SiteVisit = require('../models/SiteVisit');
const Estimate = require('../models/Estimate');
const { Enquiry } = require('../models/Enquiry');

// @desc    Get all work orders
// @route   GET /api/workorders
// @access  Private (all authorized roles)
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
      .populate('stageHistory.actionBy', 'name email role')
      .populate('accountsApproval.approvedBy', 'name email')
      .populate('materialsVerified.verifiedBy', 'name email')
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

// @desc    Get single work order with all linked tasks and stage history
// @route   GET /api/workorders/:id
// @access  Private (all authorized roles)
const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findById(id)
      .populate('enquiryId', 'clientName phone email address roofType notes')
      .populate('estimateId')
      .populate('createdBy', 'name email')
      .populate('assignedPM', 'name email')
      .populate('stageHistory.actionBy', 'name email role')
      .populate('accountsApproval.approvedBy', 'name email')
      .populate('materialsVerified.verifiedBy', 'name email');

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

// Helper to prefill initial BOM line items from estimate
const generateInitialBOM = (estimate) => {
  const inputData = estimate.inputData || {};
  const results = estimate.results || {};
  const costs = results.costs || {};
  const span = inputData.span || results.span || 0;
  const length = inputData.length || results.length || 0;

  return [
    {
      name: `Roofing Sheets (${results.th || 0.6}mm BMT Profile)`,
      quantity: Math.round(results.sheetKg || (span * length * 4.5)),
      unit: 'kg',
      specification: `${results.panels || 0} panels cut to ${results.finalCut?.toFixed(2) || 0}m arch arc`,
      estimatedCost: costs.sheetCost || 0,
      notes: 'Self-supported arch panels'
    },
    {
      name: 'Structural Steel Sections & Columns',
      quantity: Math.round(results.sheetKg || (span * length * 5)),
      unit: 'kg',
      specification: `${results.bays || 1} bays, ${results.ncol || 2} columns with baseplates`,
      estimatedCost: costs.labourCost || 0,
      notes: 'Structural frame and foundation tie elements'
    },
    {
      name: 'Hardware, Fasteners, Anchor Bolts & Silicone Sealants',
      quantity: 1,
      unit: 'set',
      specification: 'High tensile fasteners, anchor bolts and UV-resistant sealants',
      estimatedCost: costs.consumables || 0,
      notes: 'Full installation and erection kit'
    }
  ];
};

// @desc    GATE 1 (SALES): Issue Sales Work Order & Approval to Accounts
// @route   POST /api/workorders/issue-from-sales or POST /api/workorders
// @access  Private (sales, admin, projectmanager)
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

    const clientName = enquiry.clientName || inputData.clientName || 'General Client';
    const siteAddress = enquiry.address || inputData.location || inputData.address || 'Site Location';
    const roofModel = estimate.model || 'Standard Model';
    const span = inputData.span || results.span || 0;
    const length = inputData.length || results.length || 0;
    const height = inputData.height || results.height || 0;
    const grandTotal = costs.grandTotal || costs.beforeGst || 0;

    const initialBOM = generateInitialBOM(estimate);

    // Create Work Order in 'pending_accounts_approval' status
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
      status: 'pending_accounts_approval',
      priority: priority || 'medium',
      targetDate: targetDate || undefined,
      notes: notes || '',
      materialList: initialBOM,
      stageHistory: [
        {
          stage: 'sales_issued',
          actionBy: req.user._id,
          actionRole: req.user.role,
          timestamp: new Date(),
          notes: notes || 'Sales Work Order & Approval issued to Accounts'
        }
      ],
      createdBy: req.user._id,
      assignedPM: assignedPM || undefined
    });

    await workOrder.save();

    // Update estimate status
    estimate.status = 'work_order_issued';
    await estimate.save();

    return res.status(201).json({
      success: true,
      message: 'Sales Work Order issued to Accounts for commercial approval',
      workOrder
    });
  } catch (error) {
    console.error('Error creating work order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to issue work order',
      error: error.message
    });
  }
};

// @desc    GATE 2 (ACCOUNTS): Confirm client quotation & payment terms; Issue Work Order & Approval to Design
// @route   POST /api/workorders/:id/accounts-approve
// @access  Private (accounts, admin)
const accountsApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentTerms, advanceReceived, notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    workOrder.status = 'pending_design';
    workOrder.accountsApproval = {
      approved: true,
      approvedAt: new Date(),
      approvedBy: req.user._id,
      paymentTerms: paymentTerms || 'Agreed terms',
      advanceReceived: Number(advanceReceived) || 0,
      notes: notes || ''
    };

    workOrder.stageHistory.push({
      stage: 'accounts_approved',
      actionBy: req.user._id,
      actionRole: req.user.role,
      timestamp: new Date(),
      notes: notes || `Quotation & payment confirmed. Advance: ₹${Number(advanceReceived || 0).toLocaleString('en-IN')}`
    });

    await workOrder.save();

    // Auto-create or activate Design Task for Design department
    let designTask = await DesignTask.findOne({ workOrderId: workOrder._id });
    if (!designTask) {
      designTask = await DesignTask.create({
        workOrderId: workOrder._id,
        title: `Structural Fabrication Drawings — ${workOrder.refCode}`,
        description: `Prepare structural fabrication & erection drawings for ${workOrder.clientName} (${workOrder.roofModel}, ${workOrder.span}m x ${workOrder.length}m)`,
        status: 'in_progress',
        dueDate: workOrder.targetDate,
        createdBy: req.user._id
      });
    } else {
      designTask.status = 'in_progress';
      await designTask.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Commercial terms confirmed. Work Order handed over to Design.',
      workOrder,
      designTask
    });
  } catch (error) {
    console.error('Accounts approval error:', error);
    return res.status(500).json({ success: false, message: 'Approval failed', error: error.message });
  }
};

// @desc    GATE 3 (DESIGN): Prepare drawings & hand over Approval and Drawings to Project Manager
// @route   POST /api/workorders/:id/design-submit
// @access  Private (design, admin)
const designSubmitDrawings = async (req, res) => {
  try {
    const { id } = req.params;
    const { drawingFiles, notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (drawingFiles && Array.isArray(drawingFiles) && drawingFiles.length > 0) {
      workOrder.drawingFiles = [...(workOrder.drawingFiles || []), ...drawingFiles];
    }

    workOrder.status = 'pending_pm_review';
    workOrder.revisionNotes = ''; // clear any prior revision requests

    workOrder.stageHistory.push({
      stage: 'drawings_submitted',
      actionBy: req.user._id,
      actionRole: req.user.role,
      timestamp: new Date(),
      notes: notes || 'Structural drawings prepared and submitted to Project Manager'
    });

    await workOrder.save();

    // Update Design Task status
    const designTask = await DesignTask.findOne({ workOrderId: workOrder._id });
    if (designTask) {
      designTask.status = 'review';
      if (drawingFiles && drawingFiles.length > 0) {
        designTask.drawingFiles = [...(designTask.drawingFiles || []), ...drawingFiles];
      }
      await designTask.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Drawings handed over to Project Manager for material list preparation and review',
      workOrder,
      designTask
    });
  } catch (error) {
    console.error('Design submit error:', error);
    return res.status(500).json({ success: false, message: 'Submission failed', error: error.message });
  }
};

// @desc    GATE 4 (PROJECT MANAGER): Prepare / verify Material List & decide (Revise drawing OR Release to Purchase & Accounts)
// @route   POST /api/workorders/:id/pm-review
// @access  Private (projectmanager, admin)
const pmReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, materialList, revisionNotes, notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (decision === 'revise') {
      // Loop back to Design for drawing revision
      workOrder.status = 'drawing_revision';
      workOrder.revisionNotes = revisionNotes || 'Drawing revision requested by Project Manager';
      workOrder.stageHistory.push({
        stage: 'drawing_revision_requested',
        actionBy: req.user._id,
        actionRole: req.user.role,
        timestamp: new Date(),
        notes: revisionNotes || 'Revision required before material list finalization'
      });

      await workOrder.save();

      const designTask = await DesignTask.findOne({ workOrderId: workOrder._id });
      if (designTask) {
        designTask.status = 'rejected';
        designTask.notes = revisionNotes;
        await designTask.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Drawing revision requested and sent back to Design Engineer',
        workOrder
      });
    }

    // Decision === 'approve': release Material List to Purchase & Accounts
    if (materialList && Array.isArray(materialList)) {
      workOrder.materialList = materialList;
    }

    workOrder.status = 'pending_purchase';
    workOrder.stageHistory.push({
      stage: 'material_list_released',
      actionBy: req.user._id,
      actionRole: req.user.role,
      timestamp: new Date(),
      notes: notes || 'Approval, Drawings and Material List released to Purchase and Accounts'
    });

    await workOrder.save();

    // Auto-create or update Purchase Request with the verified Material List
    let purchaseRequest = await PurchaseRequest.findOne({ workOrderId: workOrder._id });
    const prItems = (workOrder.materialList || []).map((m) => ({
      name: m.name,
      quantity: m.quantity,
      unit: m.unit || 'kg',
      estimatedCost: m.estimatedCost || 0,
      notes: m.specification || m.notes || ''
    }));

    if (!purchaseRequest) {
      purchaseRequest = await PurchaseRequest.create({
        workOrderId: workOrder._id,
        items: prItems,
        status: 'pending',
        totalEstimate: workOrder.grandTotal,
        notes: `Procurement based on PM Material List for ${workOrder.refCode}`,
        createdBy: req.user._id
      });
    } else {
      purchaseRequest.items = prItems;
      purchaseRequest.status = 'pending';
      await purchaseRequest.save();
    }

    const designTask = await DesignTask.findOne({ workOrderId: workOrder._id });
    if (designTask) {
      designTask.status = 'approved';
      await designTask.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Approval, Drawings and Material List released to Purchase and Accounts',
      workOrder,
      purchaseRequest
    });
  } catch (error) {
    console.error('PM review error:', error);
    return res.status(500).json({ success: false, message: 'PM review failed', error: error.message });
  }
};

// @desc    GATE 5 (PURCHASE): Mark materials ordered from suppliers
// @route   POST /api/workorders/:id/purchase-ordered
// @access  Private (purchase, admin)
const purchaseMarkOrdered = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierName, notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    workOrder.status = 'pending_delivery';
    workOrder.stageHistory.push({
      stage: 'purchase_ordered',
      actionBy: req.user._id,
      actionRole: req.user.role,
      timestamp: new Date(),
      notes: notes || `Purchase orders issued to suppliers: ${supplierName || 'Selected Suppliers'}`
    });

    await workOrder.save();

    const pr = await PurchaseRequest.findOne({ workOrderId: workOrder._id });
    if (pr) {
      pr.status = 'ordered';
      if (supplierName) pr.supplierName = supplierName;
      await pr.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Materials ordered from suppliers. Awaiting delivery to Workshop.',
      workOrder
    });
  } catch (error) {
    console.error('Purchase ordered error:', error);
    return res.status(500).json({ success: false, message: 'Action failed', error: error.message });
  }
};

// @desc    GATE 6A (WORKSHOP): Check received physical materials against Material List & Confirm Delivery
// @route   POST /api/workorders/:id/workshop-verify-materials
// @access  Private (workshop, admin)
const workshopVerifyMaterials = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    workOrder.status = 'materials_received';
    workOrder.materialsVerified = {
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: req.user._id,
      notes: notes || 'Physical materials verified against Material List'
    };

    workOrder.stageHistory.push({
      stage: 'materials_verified',
      actionBy: req.user._id,
      actionRole: req.user.role,
      timestamp: new Date(),
      notes: notes || 'Materials delivered to workshop and verified against BOM'
    });

    await workOrder.save();

    // Auto-create or update Workshop Job
    let workshopJob = await WorkshopJob.findOne({ workOrderId: workOrder._id });
    if (!workshopJob) {
      workshopJob = await WorkshopJob.create({
        workOrderId: workOrder._id,
        title: `Fabrication & Profiling — ${workOrder.refCode}`,
        description: `Material checked and verified for ${workOrder.clientName}`,
        status: 'material_ready',
        startDate: new Date(),
        endDate: workOrder.targetDate,
        createdBy: req.user._id
      });
    } else {
      workshopJob.status = 'material_ready';
      await workshopJob.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Delivered materials verified against Material List. Ready for fabrication.',
      workOrder,
      workshopJob
    });
  } catch (error) {
    console.error('Workshop verify error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
  }
};

// @desc    GATE 6B (WORKSHOP): Start fabrication (Material / sheet production) as per approval
// @route   POST /api/workorders/:id/workshop-start-fabrication
// @access  Private (workshop, admin)
const workshopStartFabrication = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    workOrder.status = 'in_fabrication';
    workOrder.stageHistory.push({
      stage: 'fabrication_started',
      actionBy: req.user._id,
      actionRole: req.user.role,
      timestamp: new Date(),
      notes: notes || 'Fabrication and arch sheet profiling started in workshop'
    });

    await workOrder.save();

    const workshopJob = await WorkshopJob.findOne({ workOrderId: workOrder._id });
    if (workshopJob) {
      workshopJob.status = 'in_progress';
      await workshopJob.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Fabrication commenced in Workshop',
      workOrder
    });
  } catch (error) {
    console.error('Start fabrication error:', error);
    return res.status(500).json({ success: false, message: 'Action failed', error: error.message });
  }
};

// @desc    GATE 7 (WORKSHOP / PM): Fabrication complete / Work Proceeds
// @route   POST /api/workorders/:id/workshop-complete
// @access  Private (workshop, projectmanager, admin)
const workshopComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    workOrder.status = 'completed';
    workOrder.stageHistory.push({
      stage: 'completed',
      actionBy: req.user._id,
      actionRole: req.user.role,
      timestamp: new Date(),
      notes: notes || 'Fabrication completed and ready for site dispatch/erection'
    });

    await workOrder.save();

    const workshopJob = await WorkshopJob.findOne({ workOrderId: workOrder._id });
    if (workshopJob) {
      workshopJob.status = 'completed';
      await workshopJob.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Fabrication and production completed successfully',
      workOrder
    });
  } catch (error) {
    console.error('Workshop complete error:', error);
    return res.status(500).json({ success: false, message: 'Action failed', error: error.message });
  }
};

// @desc    Update work order general info
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
    if (req.body.materialList !== undefined) workOrder.materialList = req.body.materialList;

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

// @desc    Get work order stats by stage
// @route   GET /api/workorders/stats
// @access  Private (all authorized roles)
const getWorkOrderStats = async (req, res) => {
  try {
    const [
      total,
      pending_accounts,
      pending_design,
      pending_pm_review,
      drawing_revision,
      pending_purchase,
      pending_delivery,
      materials_received,
      in_fabrication,
      completed
    ] = await Promise.all([
      WorkOrder.countDocuments(),
      WorkOrder.countDocuments({ status: 'pending_accounts_approval' }),
      WorkOrder.countDocuments({ status: 'pending_design' }),
      WorkOrder.countDocuments({ status: 'pending_pm_review' }),
      WorkOrder.countDocuments({ status: 'drawing_revision' }),
      WorkOrder.countDocuments({ status: 'pending_purchase' }),
      WorkOrder.countDocuments({ status: 'pending_delivery' }),
      WorkOrder.countDocuments({ status: 'materials_received' }),
      WorkOrder.countDocuments({ status: 'in_fabrication' }),
      WorkOrder.countDocuments({ status: 'completed' })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending_accounts,
        pending_design,
        pending_pm_review,
        drawing_revision,
        pending_purchase,
        pending_delivery,
        materials_received,
        in_fabrication,
        completed
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
  accountsApprove,
  designSubmitDrawings,
  pmReview,
  purchaseMarkOrdered,
  workshopVerifyMaterials,
  workshopStartFabrication,
  workshopComplete,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats
};
