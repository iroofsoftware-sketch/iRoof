import mongoose from 'mongoose';

const ThicknessPricingSchema = new mongoose.Schema(
  {
    thickness: {
      type: Number,
      required: true,
    },
    baseRatePerWt: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 18,
    },
    transportation: {
      type: Number,
      required: true,
    },
    loadingUnloading: {
      type: Number,
      required: true,
    },
    finalRatePerKg: {
      type: Number,
      required: true,
    },
    ratePerSqFt: {
      type: Number,
      required: true,
    },
    roundOff: {
      type: Number,
      required: true,
    },
    margin: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const ThicknessPricing = mongoose.model('ThicknessPricing', ThicknessPricingSchema);

export default ThicknessPricing;
