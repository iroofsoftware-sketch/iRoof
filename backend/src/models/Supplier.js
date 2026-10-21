const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String },
    gstin: { type: String, trim: true }, // GST Identification Number
    materials: [{ type: String, trim: true }], // e.g. ["Roofing Sheets", "Structural Steel"]
    paymentTerms: { type: String, default: '30 days' },
    bankName: { type: String },
    bankAccount: { type: String },
    ifscCode: { type: String },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
    createdBy: { type: ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
