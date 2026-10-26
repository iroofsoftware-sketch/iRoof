const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  refCode: { type: String, unique: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },
  clientName: String,
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'other'], default: 'bank_transfer' },
  transactionRef: String,
  paymentDate: { type: Date, default: Date.now },
  notes: String,
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

paymentSchema.pre('save', async function (next) {
  if (!this.refCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Payment').countDocuments();
    this.refCode = `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
