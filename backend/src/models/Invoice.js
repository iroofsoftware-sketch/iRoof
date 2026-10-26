const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const invoiceSchema = new mongoose.Schema(
  {
    refCode: { type: String, unique: true }, // INV-YYYY-NNNN (auto-generated)
    workOrderId: { type: ObjectId, ref: 'WorkOrder', required: true },
    estimateId: { type: ObjectId, ref: 'Estimate' },
    clientName: { type: String, required: true },
    clientPhone: { type: String },
    clientEmail: { type: String },
    clientAddress: { type: String },

    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    paymentTerms: { type: String, default: '30 days' }, // e.g. "30 days", "On delivery"

    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'lot' },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true }
      }
    ],

    subtotal: { type: Number, required: true },
    gstRate: { type: Number, default: 18 },
    gstAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number }, // grandTotal - amountPaid

    status: {
      type: String,
      enum: ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'draft'
    },

    notes: { type: String },
    createdBy: { type: ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Auto refCode & amountDue calculation
invoiceSchema.pre('save', async function () {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  this.amountDue = Math.max(0, (this.grandTotal || 0) - (this.amountPaid || 0));
});

module.exports = mongoose.model('Invoice', invoiceSchema);
