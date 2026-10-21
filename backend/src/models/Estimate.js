const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema(
  {
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry'
    },
    model: {
      type: String,
      required: [true, 'Structural model specification is required'],
      trim: true
    },
    inputData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Input parameters are required'],
      default: {}
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Calculation results are required'],
      default: {}
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Estimate', estimateSchema);
