const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const stageHistorySchema = new mongoose.Schema({
  stage: String,
  action: String,
  performedBy: { type: ObjectId, ref: 'User' },
  note: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const bomItemSchema = new mongoose.Schema({
  materialName: String,
  specification: String,
  quantity: Number,
  unit: String,
  estimatedCost: Number,
}, { _id: false });

const noteSchema = new mongoose.Schema({
  text: String,
  addedBy: { type: ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const workOrderSchema = new mongoose.Schema(
  {
    refCode: { type: String, unique: true }, // WO-YYYY-NNNN
    enquiryId: { type: ObjectId, ref: 'Enquiry', required: true },
    estimateId: { type: ObjectId, ref: 'Estimate', required: true },
    clientName: { type: String, required: true },
    siteAddress: { type: String },
    roofModel: { type: String },
    span: { type: Number },
    length: { type: Number },
    height: { type: Number },
    grandTotal: { type: Number },

    // Stage-gate status
    status: {
      type: String,
      enum: [
        'draft',
        'pending_accounts',    // Gate 1: Sales issued WO
        'accounts_approved',   // Gate 2: Accounts approved
        'design_submitted',    // Gate 3: Design submitted drawings
        'pm_review',           // Gate 4: PM reviewing design
        'purchase_ordered',    // Gate 5: Purchase ordered materials
        'materials_verified',  // Gate 6A: Workshop verified materials (GRN)
        'fabrication',         // Gate 6B: Workshop in fabrication
        'completed',           // Gate 7: Work complete
        'on_hold',
        'cancelled'
      ],
      default: 'draft'
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    targetDate: { type: Date },
    notes: { type: String },

    // Stage history audit trail
    stageHistory: [stageHistorySchema],

    // BOM / Material list (set by Design at Gate 3)
    materialList: [bomItemSchema],

    // Drawing files (set by Design at Gate 3)
    drawingFiles: [{ url: String, name: String, uploadedAt: { type: Date, default: Date.now } }],

    // Attachments (general)
    attachments: [{ url: String, name: String, type: String, uploadedAt: { type: Date, default: Date.now } }],

    // Revision notes (PM → Design feedback)
    revisionNotes: { type: String },

    // Accounts approval details
    accountsApproval: {
      approvedBy: { type: ObjectId, ref: 'User' },
      approvedAt: Date,
      note: String,
    },

    // Materials verified by Workshop
    materialsVerified: {
      verifiedBy: { type: ObjectId, ref: 'User' },
      verifiedAt: Date,
      note: String,
    },

    // Notes log
    logNotes: [noteSchema],

    createdBy: { type: ObjectId, ref: 'User', required: true },
    assignedPM: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

workOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `WO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
