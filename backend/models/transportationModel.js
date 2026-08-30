import mongoose from 'mongoose';

const transportationSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    required: true,
    enum: ['Eicher','Trailer','Ace'], 
  },
  minCharge: {
    type: Number,
    required: true,
  },
  minKmCovered: {
    type: Number,
    required: true,
  },
  perKmCharge: {
    type: Number,
    required: true,
  },
  petrolCharge: {
    type: Number,
    required: true,
    default: 115, 
  },
});

const Transportation = mongoose.model('Transportation', transportationSchema);

export default Transportation;
