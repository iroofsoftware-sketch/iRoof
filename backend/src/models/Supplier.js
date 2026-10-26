const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  state: { type: String, default: 'Kerala' },
  gstin: String,
  bankName: String,
  accountNumber: String,
  ifscCode: String,
  accountHolderName: String,
  notes: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
