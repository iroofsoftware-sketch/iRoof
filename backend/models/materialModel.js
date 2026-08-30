import mongoose from 'mongoose';

const materialCostSchema = new mongoose.Schema({
  material: {
    type: String,
    required: true,
    unique: true,
  },
  ratePerKg: {
    type: Number,
    default: 0,
  },
  includingTax: {
    type: Number,
    default: 0,
  },
  lastUpdatedDate: {
    type: Date,
    default: Date.now,
  },
  bendingCostschannelPerMeter: {
    type: Number,
    default: 0,
  },
  bendingCostsgutterPerMeter: {
    type: Number,
    default: 0,
  },
});

// Middleware to update lastUpdatedDate before save
materialCostSchema.pre('save', function (next) {
  this.lastUpdatedDate = Date.now();
  next();
});

// Middleware to update lastUpdatedDate before findOneAndUpdate
materialCostSchema.pre('findOneAndUpdate', function (next) {
  this.set({ lastUpdatedDate: Date.now() });
  next();
});

const MaterialCost = mongoose.model('MaterialCost', materialCostSchema);

export default MaterialCost;
