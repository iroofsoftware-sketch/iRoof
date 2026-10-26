const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String },
  city: { type: String },
  state: { type: String, default: 'Kerala' },
  pincode: { type: String },
  gstin: { type: String },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
