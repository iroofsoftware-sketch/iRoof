import mongoose from "mongoose";

const labourCostSchema = new mongoose.Schema({
  category: {
    type: String, 
    required: true,
    unique: true, 
  },
  localWork: {
    type: Number,
    default: 0, 
  },
  siteWork: {
    type: Number,
    default: 0,
  },
});

const LabourCost = mongoose.model("LabourCost", labourCostSchema);
export default LabourCost;
