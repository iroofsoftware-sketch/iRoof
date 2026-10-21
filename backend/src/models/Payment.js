const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: ObjectId, ref: 'Invoice', required: true },
    refCode: { type: String }, // PAY-YYYY-NNNN
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMode: {
      type: String,
      enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'other'],
      default: 'bank_transfer'
    },
    referenceNo: { type: String }, // UTR / cheque number / UPI ref
    notes: { type: String },
    recordedBy: { type: ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

paymentSchema.pre('save', async function (next) {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
