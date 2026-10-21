const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const purchaseOrderSchema = new mongoose.Schema(
  {
    refCode: { type: String, unique: true }, // PO-YYYY-NNNN (auto-generated)
    purchaseRequestId: { type: ObjectId, ref: 'PurchaseRequest', required: true },
    workOrderId: { type: ObjectId, ref: 'WorkOrder' },
    supplierId: { type: ObjectId, ref: 'Supplier', required: true },

    poDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date, required: true },
    deliveryAddress: { type: String }, // site address or workshop address

    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'kg' },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true }
      }
    ],

    subtotal: { type: Number, required: true },
    gstRate: { type: Number, default: 18 },
    gstAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },

    status: {
      type: String,
      enum: ['draft', 'sent', 'acknowledged', 'delivered', 'cancelled'],
      default: 'draft'
    },

    notes: { type: String },
    createdBy: { type: ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Auto refCode
purchaseOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
