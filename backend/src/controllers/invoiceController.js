const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const WorkOrder = require('../models/WorkOrder');
const Estimate = require('../models/Estimate');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (admin, accounts)
const getInvoices = async (req, res) => {
  try {
    const { status, search, limit, page } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { clientName: { $regex: q, $options: 'i' } },
        { refCode: { $regex: q, $options: 'i' } }
      ];
    }

    const query = Invoice.find(filter)
      .populate('workOrderId', 'refCode clientName status')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));
    if (page && limit) query.skip((Number(page) - 1) * Number(limit));

    const [invoices, total] = await Promise.all([
      query.exec(),
      Invoice.countDocuments(filter)
    ]);

    // Check for overdue dynamically
    const now = new Date();
    const updatedInvoices = invoices.map((inv) => {
      const doc = inv.toObject();
      if (
        (doc.status === 'sent' || doc.status === 'partial') &&
        doc.dueDate &&
        new Date(doc.dueDate) < now &&
        doc.amountDue > 0
      ) {
        doc.isOverdue = true;
      }
      return doc;
    });

    return res.status(200).json({
      success: true,
      count: updatedInvoices.length,
      total,
      data: updatedInvoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoices',
      error: error.message
    });
  }
};

// @desc    Get invoice by ID with payment history
// @route   GET /api/invoices/:id
// @access  Private (admin, accounts)
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate({
        path: 'workOrderId',
        populate: { path: 'enquiryId', select: 'clientName phone email address roofType' }
      })
      .populate('estimateId')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const payments = await Payment.find({ invoiceId: invoice._id })
      .populate('recordedBy', 'name email')
      .sort({ paymentDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        ...invoice.toObject(),
        payments
      }
    });
  } catch (error) {
    console.error('Error fetching invoice by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice details',
      error: error.message
    });
  }
};

// @desc    Create invoice from completed work order
// @route   POST /api/invoices
// @access  Private (admin, accounts)
const createInvoice = async (req, res) => {
  try {
    const { workOrderId, dueDate, paymentTerms, notes } = req.body;

    if (!workOrderId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Work order and due date are required'
      });
    }

    const workOrder = await WorkOrder.findById(workOrderId)
      .populate('enquiryId')
      .populate('estimateId');

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    const enquiry = workOrder.enquiryId || {};
    const estimate = workOrder.estimateId || {};
    const results = estimate.results || {};
    const costs = results.costs || {};
    const rates = estimate.inputData?.rates || {};

    // 1. Build line items
    const lineItems = [];

    // Sheet material line item
    const sheetCost = costs.sheetCost || Math.round((results.area || 0) * (rates.sheetRate || 48));
    lineItems.push({
      description: `Roofing Sheets (${results.th || 0.6}mm BMT, Profile Cover ${Math.round((results.cover || 0.305) * 1000)}mm)`,
      quantity: Number((results.area || 1).toFixed(1)),
      unit: 'ft²',
      rate: rates.sheetRate || 48,
      amount: sheetCost
    });

    // Structural labour line item
    const labourCost = costs.labourCost || Math.round((results.sheetKg || 0) * (rates.structLabRate || 26));
    lineItems.push({
      description: `Structural Steel Fabrication & Erection (${results.bays || 1} bays, ${results.ncol || 2} columns)`,
      quantity: Number((results.sheetKg || 1).toFixed(1)),
      unit: 'kg',
      rate: rates.structLabRate || 26,
      amount: labourCost
    });

    // Consumables line item
    const consumablesCost = costs.consumables || Math.round((results.sheetKg || 0) * (rates.structConRate || 2) + (results.area || 0) * (rates.roofConRate || 2));
    lineItems.push({
      description: 'Hardware, Fasteners, Sealants & Consumables',
      quantity: 1,
      unit: 'lot',
      rate: consumablesCost,
      amount: consumablesCost
    });

    // Subtotal and GST
    const subtotal = costs.beforeGst || (sheetCost + labourCost + consumablesCost);
    const gstRate = 18;
    const gstAmount = costs.gst || Math.round(subtotal * 0.18);
    const grandTotal = costs.grandTotal || (subtotal + gstAmount);

    const invoice = new Invoice({
      workOrderId: workOrder._id,
      estimateId: estimate._id || undefined,
      clientName: workOrder.clientName || enquiry.clientName || 'Valued Customer',
      clientPhone: enquiry.phone || '',
      clientEmail: enquiry.email || '',
      clientAddress: workOrder.siteAddress || enquiry.address || '',
      dueDate: new Date(dueDate),
      paymentTerms: paymentTerms || '30 days',
      lineItems,
      subtotal,
      gstRate,
      gstAmount,
      grandTotal,
      amountPaid: 0,
      amountDue: grandTotal,
      status: 'sent',
      notes: notes || '',
      createdBy: req.user._id
    });

    await invoice.save();

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

// @desc    Update invoice
// @route   PATCH /api/invoices/:id
// @access  Private (admin, accounts)
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dueDate, paymentTerms, notes } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (status) invoice.status = status;
    if (dueDate) invoice.dueDate = new Date(dueDate);
    if (paymentTerms) invoice.paymentTerms = paymentTerms;
    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// @desc    Delete invoice (only if draft)
// @route   DELETE /api/invoices/:id
// @access  Private (admin only)
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be permanently deleted'
      });
    }

    await Invoice.findByIdAndDelete(id);
    await Payment.deleteMany({ invoiceId: id });

    return res.status(200).json({
      success: true,
      message: 'Draft invoice deleted'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
};

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Private (admin, accounts)
const getInvoiceStats = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let totalBilled = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;
    let overdueCount = 0;
    let thisMonthBilled = 0;
    let thisMonthReceived = 0;

    const now = new Date();

    invoices.forEach((inv) => {
      const grandTotal = inv.grandTotal || 0;
      const amountPaid = inv.amountPaid || 0;
      const amountDue = Math.max(0, grandTotal - amountPaid);

      if (inv.status !== 'cancelled') {
        totalBilled += grandTotal;
        totalReceived += amountPaid;

        if (inv.status !== 'paid') {
          totalOutstanding += amountDue;
        }

        if (
          inv.status === 'overdue' ||
          ((inv.status === 'sent' || inv.status === 'partial') &&
            inv.dueDate &&
            new Date(inv.dueDate) < now &&
            amountDue > 0)
        ) {
          overdueCount++;
        }

        if (inv.createdAt >= startOfMonth) {
          thisMonthBilled += grandTotal;
        }
      }
    });

    // Calculate this month received from payments
    const paymentsThisMonth = await Payment.find({
      paymentDate: { $gte: startOfMonth }
    });
    thisMonthReceived = paymentsThisMonth.reduce((acc, p) => acc + (p.amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalInvoices: invoices.length,
        totalBilled,
        totalReceived,
        totalOutstanding,
        overdueCount,
        thisMonthBilled,
        thisMonthReceived
      }
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice statistics',
      error: error.message
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats
};
