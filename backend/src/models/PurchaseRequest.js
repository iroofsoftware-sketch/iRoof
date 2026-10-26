const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const purchaseRequestSchema = new mongoose.Schema(
  {
    workOrderId: { type: ObjectId, ref: 'WorkOrder', required: true },
    refCode: { type: String }, // PR-YYYY-NNNN
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'kg' },
        estimatedCost: { type: Number },
        notes: { type: String }
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'ordered', 'received', 'cancelled'],
      default: 'pending'
    },
    assignedTo: { type: ObjectId, ref: 'User' },
    totalEstimate: { type: Number },
    supplierName: { type: String },
    notes: { type: String },
    createdBy: { type: ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

purchaseRequestSchema.pre('save', async function () {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `PR-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);
