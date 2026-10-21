const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const workOrderSchema = new mongoose.Schema(
  {
    refCode: { type: String, unique: true }, // WO-YYYY-NNNN (auto-generated)
    enquiryId: { type: ObjectId, ref: 'Enquiry', required: true },
    estimateId: { type: ObjectId, ref: 'Estimate', required: true },
    clientName: { type: String, required: true },
    siteAddress: { type: String },
    roofModel: { type: String }, // from estimate.model
    span: { type: Number }, // from estimate.inputData
    length: { type: Number },
    height: { type: Number },
    grandTotal: { type: Number }, // from estimate.results.costs.grandTotal or estimate.results.grandTotal
    status: {
      type: String,
      enum: ['draft', 'active', 'on_hold', 'completed', 'cancelled'],
      default: 'draft'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    targetDate: { type: Date },
    notes: { type: String },
    createdBy: { type: ObjectId, ref: 'User', required: true },
    assignedPM: { type: ObjectId, ref: 'User' } // project manager
  },
  { timestamps: true }
);

// Auto-generate refCode before save:
// WO-2025-0001 format, padded 4 digits, year from current year
workOrderSchema.pre('save', async function () {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `WO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
