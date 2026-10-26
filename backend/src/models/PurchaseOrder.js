const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  materialName: String,
  specification: String,
  quantity: Number,
  unit: String,
  unitPrice: Number,
  amount: Number,
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  refCode: { type: String, unique: true },
  purchaseRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest' },
  workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName: String,
  items: [poItemSchema],
  subtotal: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'sent', 'acknowledged', 'delivered', 'cancelled'], default: 'draft' },
  expectedDelivery: Date,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

purchaseOrderSchema.pre('save', async function (next) {
  if (!this.refCode) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.refCode = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
