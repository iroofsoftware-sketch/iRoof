const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [{ refCode: { $regex: search, $options: 'i' } }, { clientName: { $regex: search, $options: 'i' } }];

    const invoices = await Invoice.find(filter)
      .populate('workOrderId', 'refCode')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('workOrderId', 'refCode clientName')
      .populate('createdBy', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const payments = await Payment.find({ invoiceId: invoice._id }).sort({ paymentDate: -1 });
    return res.status(200).json({ success: true, data: { invoice, payments } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    // Calculate amounts
    const subtotal = (data.items || []).reduce((s, i) => s + (i.amount || 0), 0);
    const cgst = (subtotal * (data.cgstRate || 9)) / 100;
    const sgst = (subtotal * (data.sgstRate || 9)) / 100;
    data.subtotal = subtotal;
    data.cgstAmount = cgst;
    data.sgstAmount = sgst;
    data.totalAmount = subtotal + cgst + sgst;
    data.balanceAmount = data.totalAmount;

    const invoice = await Invoice.create(data);
    return res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/invoices/:id
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/invoices/:id/payment — record a payment against invoice
const recordPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const payment = await Payment.create({
      ...req.body,
      invoiceId: invoice._id,
      workOrderId: invoice.workOrderId,
      clientName: invoice.clientName,
      receivedBy: req.user._id,
    });

    // Update invoice paid/balance
    const allPayments = await Payment.find({ invoiceId: invoice._id });
    const paidTotal = allPayments.reduce((s, p) => s + p.amount, 0);
    invoice.paidAmount = paidTotal;
    invoice.balanceAmount = invoice.totalAmount - paidTotal;
    invoice.status = invoice.balanceAmount <= 0 ? 'paid' : paidTotal > 0 ? 'partial' : 'sent';
    await invoice.save();

    return res.status(201).json({ success: true, data: payment, invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInvoices, getInvoiceById, createInvoice, updateInvoice, recordPayment };
