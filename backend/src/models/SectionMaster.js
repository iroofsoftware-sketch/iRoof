const mongoose = require('mongoose');

const sectionMasterSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true
    },
    weight: {
      type: Number,
      required: [true, 'Weight per meter is required'],
      min: [0, 'Weight must be a positive number']
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: [0, 'Rate must be a positive number']
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SectionMaster', sectionMasterSchema);
