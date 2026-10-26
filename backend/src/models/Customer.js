const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer / Contact name is required'],
      trim: true,
      index: true
    },
    companyName: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Primary phone number is required'],
      trim: true,
      index: true
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true,
      default: 'Tamil Nadu'
    },
    pincode: {
      type: String,
      trim: true
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      enum: ['Industrial', 'Commercial', 'PEB Builder', 'Architect', 'Individual', 'Govt/Infra'],
      default: 'Industrial'
    },
    status: {
      type: String,
      enum: ['Active', 'Lead', 'Inactive'],
      default: 'Active'
    },
    creditLimit: {
      type: Number,
      default: 0
    },
    paymentTerms: {
      type: String,
      default: '30 days'
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Customer', customerSchema);
