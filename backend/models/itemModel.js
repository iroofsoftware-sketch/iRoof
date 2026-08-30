import mongoose from 'mongoose';
 
const ItemSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialCost',
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  ratePerMeter: {
    type: Number,
    required: true,
  },
  stdKg: {
    type: Number,
    default: 0,
  },
  kgPerMeter: {
    type: Number,
    default: 0,
  },
  surfaceAreaPerMeter: {
    type: Number,
    default: 0,
  },
  paintingCostOrZinkDippingCost: {
    type: Number,
    default: 0,
  },
  finalPerMeter:{
    type:Number,
    required:true
  }
});
 
const Items = mongoose.model('Item', ItemSchema);
 
export default Items;