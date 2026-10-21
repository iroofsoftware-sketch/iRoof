const mongoose = require('mongoose');

const rateMasterSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      default: 'kg'
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: [0, 'Rate must be a positive number']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'sheeting'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RateMaster', rateMasterSchema);
