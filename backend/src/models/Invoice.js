const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: String,
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'sqft' },
  rate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  refCode: { type: String, unique: true },
  workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },
  estimateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Estimate' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  clientName: String,
  clientPhone: String,
  clientEmail: String,
  clientAddress: String,
  clientGSTIN: String,
  items: [invoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  cgstRate: { type: Number, default: 9 },
  sgstRate: { type: Number, default: 9 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'sent', 'partial', 'paid', 'cancelled'], default: 'draft' },
  dueDate: Date,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate INV ref
invoiceSchema.pre('save', async function (next) {
  if (!this.refCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Invoice').countDocuments();
    this.refCode = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
