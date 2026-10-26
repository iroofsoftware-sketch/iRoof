const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// @desc    Record new payment against an invoice
// @route   POST /api/payments
// @access  Private (admin, accounts)
const recordPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentDate, paymentMode, referenceNo, notes } = req.body;

    if (!invoiceId || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid invoice ID and positive payment amount are required'
      });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const paymentAmount = Number(amount);

    // 1. Create Payment record
    const payment = new Payment({
      invoiceId: invoice._id,
      amount: paymentAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMode: paymentMode || 'bank_transfer',
      referenceNo: referenceNo || '',
      notes: notes || '',
      recordedBy: req.user._id
    });
    await payment.save();

    // 2. Update Invoice
    invoice.amountPaid = (invoice.amountPaid || 0) + paymentAmount;
    invoice.amountDue = Math.max(0, invoice.grandTotal - invoice.amountPaid);

    if (invoice.amountPaid >= invoice.grandTotal) {
      invoice.status = 'paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    const populatedPayment = await Payment.findById(payment._id).populate(
      'recordedBy',
      'name email'
    );

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully`,
      payment: populatedPayment,
      invoice
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

// @desc    Get all payments for a specific invoice
// @route   GET /api/payments?invoiceId=:id
// @access  Private (admin, accounts)
const getPaymentsByInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.query;
    const filter = {};
    if (invoiceId) {
      filter.invoiceId = invoiceId;
    }

    const payments = await Payment.find(filter)
      .populate('recordedBy', 'name email')
      .sort({ paymentDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error.message
    });
  }
};

// @desc    Delete payment and revert invoice amounts
// @route   DELETE /api/payments/:id
// @access  Private (admin only)
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      invoice.amountPaid = Math.max(0, (invoice.amountPaid || 0) - payment.amount);
      invoice.amountDue = Math.max(0, invoice.grandTotal - invoice.amountPaid);

      if (invoice.amountPaid >= invoice.grandTotal) {
        invoice.status = 'paid';
      } else if (invoice.amountPaid > 0) {
        invoice.status = 'partial';
      } else {
        invoice.status = 'sent';
      }
      await invoice.save();
    }

    await Payment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Payment deleted and invoice balances reverted',
      invoice
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
      error: error.message
    });
  }
};

module.exports = {
  recordPayment,
  getPaymentsByInvoice,
  deletePayment
};
