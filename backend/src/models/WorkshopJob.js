const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const workshopJobSchema = new mongoose.Schema(
  {
    workOrderId: { type: ObjectId, ref: 'WorkOrder', required: true },
    refCode: { type: String }, // WJ-YYYY-NNNN
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['pending', 'material_ready', 'in_progress', 'quality_check', 'completed'],
      default: 'pending'
    },
    assignedTo: { type: ObjectId, ref: 'User' },
    startDate: { type: Date },
    endDate: { type: Date },
    notes: { type: String },
    createdBy: { type: ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

workshopJobSchema.pre('save', async function () {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `WJ-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('WorkshopJob', workshopJobSchema);
