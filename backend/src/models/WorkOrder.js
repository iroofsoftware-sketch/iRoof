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
    grandTotal: { type: Number }, // from estimate.results.costs.grandTotal
    status: {
      type: String,
      enum: [
        'draft',
        'pending_accounts_approval', // 1. Issued by Sales, awaiting Accounts commercial approval
        'pending_design',            // 2. Approved by Accounts, handed to Design for drawings
        'pending_pm_review',         // 3. Drawings submitted by Design, PM preparing Material List
        'drawing_revision',          // 3b. PM requested drawing revision from Design
        'pending_purchase',          // 4. PM approved & released Material List to Purchase & Accounts
        'pending_delivery',          // 5. Purchase Order issued to Suppliers, awaiting material delivery
        'materials_received',        // 6a. Physical materials delivered & verified by Workshop against Material List
        'in_fabrication',            // 6b. Fabrication / Sheet production in progress
        'completed',                 // 7. Handover / Work completed
        'active',                    // Legacy general active
        'on_hold',
        'cancelled'
      ],
      default: 'pending_accounts_approval'
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    targetDate: { type: Date },
    notes: { type: String },

    // Stage Gate Flow Data
    stageHistory: [
      {
        stage: { type: String, required: true },
        actionBy: { type: ObjectId, ref: 'User' },
        actionRole: { type: String },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String }
      }
    ],

    // Design Drawings uploaded by Design engineer
    drawingFiles: [
      {
        name: String,
        url: String,
        fileType: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    // Material List / BOM verified and released by Project Manager
    materialList: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'kg' },
        specification: String,
        estimatedCost: Number,
        notes: String
      }
    ],

    // Drawing Revision feedback if PM rejects/requests change
    revisionNotes: { type: String },

    // Accounts Commercial Approval
    accountsApproval: {
      approved: { type: Boolean, default: false },
      approvedAt: Date,
      approvedBy: { type: ObjectId, ref: 'User' },
      paymentTerms: String,
      advanceReceived: Number,
      notes: String
    },

    // Workshop Goods Receipt Verification (GRN vs Material List)
    materialsVerified: {
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: { type: ObjectId, ref: 'User' },
      notes: String
    },

    attachments: [
      {
        name: String,
        url: String,
        fileType: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    createdBy: { type: ObjectId, ref: 'User', required: true },
    assignedPM: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate refCode before save:
// WO-YYYY-NNNN format, padded 4 digits, year from current year
workOrderSchema.pre('save', async function () {
  if (this.isNew && !this.refCode) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.refCode = `WO-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
