const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const designTaskSchema = new mongoose.Schema(
  {
    workOrderId: { type: ObjectId, ref: 'WorkOrder', required: true },
    refCode: { type: String }, // DT-YYYY-NNNN
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'review', 'approved', 'rejected'],
      default: 'pending'
    },
    assignedTo: { type: ObjectId, ref: 'User' },
    dueDate: { type: Date },
    drawingFiles: [{ name: String, url: String, uploadedAt: Date }],
    notes: { type: String },
    createdBy: { type: ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

designTaskSchema.pre('save', async function (next) {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `DT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DesignTask', designTaskSchema);
