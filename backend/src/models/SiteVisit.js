const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const siteVisitSchema = new mongoose.Schema(
  {
    workOrderId: { type: ObjectId, ref: 'WorkOrder', required: true },
    refCode: { type: String }, // SV-YYYY-NNNN
    visitType: {
      type: String,
      enum: ['initial', 'progress', 'final', 'inspection'],
      default: 'initial'
    },
    scheduledDate: { type: Date },
    completedDate: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    assignedTo: { type: ObjectId, ref: 'User' },
    report: { type: String },
    photos: [{ url: String, caption: String, uploadedAt: Date }],
    notes: { type: String },
    createdBy: { type: ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

siteVisitSchema.pre('save', async function () {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `SV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('SiteVisit', siteVisitSchema);
