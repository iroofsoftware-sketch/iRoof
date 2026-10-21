const mongoose = require('mongoose');

const ENQUIRY_STATUSES = [
  'new',
  'visited',
  'estimated',
  'approved',
  'rejected',
  'completed'
];

const enquirySchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
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
    roofType: {
      type: String,
      trim: true,
      default: 'Normal Cantilever'
    },
    enquiryDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: {
        values: ENQUIRY_STATUSES,
        message: '{VALUE} is not a valid enquiry status'
      },
      default: 'new'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required']
    }
  },
  {
    timestamps: true
  }
);

module.exports = {
  Enquiry: mongoose.model('Enquiry', enquirySchema),
  ENQUIRY_STATUSES
};
